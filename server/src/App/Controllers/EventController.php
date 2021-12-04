<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Event;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class EventController extends BaseController
{
    use WithCrud;
    use WithPdf;

    // ——————————————————————————————————————————————————————
    // —
    // —    Actions
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(Request $request, Response $response): Response
    {
        $search = $request->getQueryParam('search', null);
        $exclude = $request->getQueryParam('exclude', null);

        if ($search) {
            $query = (new Event)
                ->addSearch($search)
                ->select(['id', 'title', 'start_date', 'end_date', 'location'])
                ->whereHas('materials');

            if ($exclude) {
                $query->where('id', '<>', $exclude);
            }

            $count = $query->count();

            $results = $query
                ->orderBy('start_date', 'desc')
                ->limit(10)
                ->get();

            return $response->withJson(['count' => $count, 'data' => $results]);
        }

        $startDate = $request->getQueryParam('start', null);
        $endDate = $request->getQueryParam('end', null);
        $deleted = (bool)$request->getQueryParam('deleted', false);
        $withMaterials = (bool)$request->getQueryParam('with-materials', false);

        $results = (new Event)
            ->setSearchPeriod($startDate, $endDate)
            ->getAll($deleted)
            ->with('Beneficiaries')
            ->with('Technicians');

        if ($withMaterials) {
            $results->with(['Materials' => function ($q) {
                $q->orderBy('name', 'asc');
            }]);
        }

        $data = $results->get()->toArray();
        $useMultipleParks = Park::count() > 1;
        $today = (new \DateTime())->setTime(0, 0, 0);
        foreach ($data as $index => $event) {
            $data[$index]['has_missing_materials'] = null;
            $data[$index]['has_not_returned_materials'] = null;
            $data[$index]['parks'] = $useMultipleParks ? Event::getParks($event['id']) : null;

            if ($event['is_archived']) {
                continue;
            }

            $eventEndDate = new \DateTime($event['end_date']);
            if ($eventEndDate >= $today) {
                $eventMissingMaterials = Event::getMissingMaterials($event['id']);
                $data[$index]['has_missing_materials'] = !empty($eventMissingMaterials);
            } elseif ($event['is_return_inventory_done']) {
                $data[$index]['has_not_returned_materials'] = Event::hasNotReturnedMaterials($event['id']);
            }
        }

        return $response->withJson(compact('data'));
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $eventData = $this->_getFormattedEvent($id);

        $eventData['has_missing_materials'] = null;
        $eventData['has_not_returned_materials'] = null;

        $today = (new \DateTime())->setTime(0, 0, 0);
        $eventEndDate = new \DateTime($eventData['end_date']);
        if ($eventEndDate >= $today) {
            $eventMissingMaterials = Event::getMissingMaterials($eventData['id']);
            $eventData['has_missing_materials'] = !empty($eventMissingMaterials);
        } elseif ($eventData['is_return_inventory_done']) {
            $eventData['has_not_returned_materials'] = Event::hasNotReturnedMaterials($eventData['id']);
        }

        return $response->withJson($eventData);
    }

    public function getMissingMaterials(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $eventMissingMaterials = Event::getMissingMaterials($id);
        if (empty($eventMissingMaterials)) {
            return $response->withJson([]);
        }

        return $response->withJson($eventMissingMaterials);
    }

    public function create(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        $id = $this->_saveEvent(null, $postData);

        return $response->withJson($this->_getFormattedEvent($id), SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $postData = (array)$request->getParsedBody();
        $id = $this->_saveEvent($id, $postData);

        return $response->withJson($this->_getFormattedEvent($id), SUCCESS_OK);
    }

    public function duplicate(Request $request, Response $response): Response
    {
        $originalId = (int)$request->getAttribute('id');
        $postData = (array)$request->getParsedBody();

        try {
            $newEvent = Event::duplicate($originalId, $postData);
        } catch (ModelNotFoundException $e) {
            throw new HttpNotFoundException($request);
        }

        return $response->withJson($this->_getFormattedEvent($newEvent->id), SUCCESS_CREATED);
    }

    public function updateMaterialReturn(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $data = (array)$request->getParsedBody();
        $this->_saveReturnQuantities($id, $data);

        return $response->withJson($this->_getFormattedEvent($id), SUCCESS_OK);
    }

    public function updateMaterialTerminate(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $data = (array)$request->getParsedBody();
        $this->_saveReturnQuantities($id, $data);

        Event::staticEdit($id, [
            'is_confirmed' => true,
            'is_return_inventory_done' => true,
        ]);

        $this->_setBrokenMaterialsQuantities($data);

        return $response->withJson($this->_getFormattedEvent($id), SUCCESS_OK);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Internal Methods
    // —
    // ——————————————————————————————————————————————————————

    protected function _saveEvent(?int $id, array $postData): int
    {
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $event = Event::staticEdit($id, $postData);

        return $event->id;
    }

    protected function _saveReturnQuantities(int $id, array $data): void
    {
        $event = Event::find($id);

        $eventMaterials = $event->Materials()->get()->toArray();
        $eventMaterialsQuantities = [];
        foreach ($eventMaterials as $material) {
            $eventMaterialsQuantities[$material['id']] = $material['pivot']['quantity'];
        };

        $quantities = [];
        $errors = [];
        foreach ($data as $quantity) {
            if (!array_key_exists('id', $quantity)) {
                continue;
            }
            $materialId = $quantity['id'];

            if (!array_key_exists('actual', $quantity) || !is_integer($quantity['actual'])) {
                $errors[] = ['id' => $materialId, 'message' => "Quantité retournée invalide."];
                continue;
            }
            $actual = (int)$quantity['actual'];

            if (!array_key_exists('broken', $quantity) || !is_integer($quantity['broken'])) {
                $errors[] = ['id' => $materialId, 'message' => "Quantité en panne invalide."];
                continue;
            }
            $broken = (int)$quantity['broken'];

            if ($actual < 0 || $broken < 0) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => "Les quantités ne peuvent pas être négatives."
                ];
                continue;
            }

            if ($actual > $eventMaterialsQuantities[$materialId]) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => "La quantité retournée ne peut pas être supérieure à la quantité sortie."
                ];
                continue;
            }

            if ($broken > $actual) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => "La quantité en panne ne peut pas être supérieure à la quantité retournée."
                ];
                continue;
            }

            $quantities[$materialId] = [
                'quantity_returned' => $actual,
                'quantity_broken' => $broken,
            ];
        }

        if (!empty($errors)) {
            $error = new ValidationException();
            $error->setValidationErrors($errors);
            throw $error;
        }

        $event->Materials()->sync($quantities);
    }

    protected function _setBrokenMaterialsQuantities(array $data): void
    {
        foreach ($data as $quantities) {
            $broken = (int)$quantities['broken'];
            if ($broken === 0) {
                continue;
            }

            $material = Material::find($quantities['id']);
            if (!$material) {
                continue;
            }

            $material->out_of_order_quantity += (int)$quantities['broken'];
            $material->save();
        }
    }

    protected function _getFormattedEvent(int $id): array
    {
        $model = (new Event)
            ->with('User')
            ->with('Technicians')
            ->with('Beneficiaries')
            ->with('Materials')
            ->with('Bills')
            ->with('Estimates')
            ->find($id);

        $result = $model->toArray();
        if ($model->bills) {
            $result['bills'] = $model->bills;
        }
        if ($model->estimates) {
            $result['estimates'] = $model->estimates;
        }

        return $result;
    }
}
