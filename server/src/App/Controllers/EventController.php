<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Models\Park;
use Robert2\API\Models\Event;
use Robert2\API\Models\Material;
use Robert2\API\Errors\ValidationException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\ServerRequest as Request;
use Slim\Http\Response;

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
        $startDate = $request->getQueryParam('start', null);
        $endDate = $request->getQueryParam('end', null);
        $deleted = (bool)$request->getQueryParam('deleted', false);

        $results = (new Event)
            ->setPeriod($startDate, $endDate)
            ->getAll($deleted)
            ->with('Beneficiaries:persons.id,first_name,last_name')
            ->with('Assignees:persons.id,first_name,last_name');

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

        return $response->withJson([ 'data' => $data ]);
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
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $originalEventData = Event::find($id);

        $originalBeneficiaries = array_map(function ($beneficiary) {
            return $beneficiary['id'];
        }, $originalEventData['beneficiaries']);

        $originalAssignees = [];
        foreach ($originalEventData['assignees'] as $assignee) {
            $originalAssignees[$assignee['id']] = [
                'position' => $assignee['pivot']['position'],
            ];
        }

        $originalMaterials = array_map(function ($material) {
            return [
                'id' => $material['id'],
                'quantity' => $material['pivot']['quantity'],
            ];
        }, $originalEventData['materials']);

        $postData = (array)$request->getParsedBody();
        $newEventData = array_merge($postData, [
            'user_id' => $postData['user_id'],
            'title' => $originalEventData['title'],
            'description' => $originalEventData['description'],
            'start_date' => $postData['start_date'],
            'end_date' => $postData['end_date'],
            'is_confirmed' => false,
            'is_archived' => false,
            'location' => $originalEventData['location'],
            'is_billable' => $originalEventData['is_billable'],
            'is_return_inventory_done' => false,
            'beneficiaries' => $originalBeneficiaries,
            'assignees' => $originalAssignees,
            'materials' => $originalMaterials,
        ]);

        $newId = $this->_saveEvent(null, $newEventData);

        return $response->withJson($this->_getFormattedEvent($newId), SUCCESS_CREATED);
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

        if (isset($postData['beneficiaries'])) {
            $event->Beneficiaries()->sync($postData['beneficiaries']);
        }

        if (isset($postData['assignees'])) {
            $event->Assignees()->sync($postData['assignees']);
        }

        if (isset($postData['materials'])) {
            $materials = [];
            foreach ($postData['materials'] as $material) {
                if ((int)$material['quantity'] <= 0) {
                    continue;
                }

                $materials[$material['id']] = [
                    'quantity' => $material['quantity']
                ];
            }
            $event->Materials()->sync($materials);
        }

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
            $materialId = $quantity['id'];
            $returned = (int)$quantity['returned'];
            $broken = (int)$quantity['broken'];

            if ($returned < 0 || $broken < 0) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => "Quantities cannot be negative."
                ];
                continue;
            }

            if ($returned > $eventMaterialsQuantities[$materialId]) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => "Returned quantity cannot be greater than quantity out."
                ];
                continue;
            }

            if ($broken > $returned) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => "Broken quantity cannot be greater than returned quantity."
                ];
                continue;
            }

            $quantities[$materialId] = [
                'quantity_returned' => $returned,
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
            ->with('Assignees')
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
