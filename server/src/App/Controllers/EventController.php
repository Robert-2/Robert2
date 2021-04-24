<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Models\Park;
use Robert2\API\Models\Event;
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
        foreach ($data as $index => $event) {
            $eventMissingMaterials = Event::getMissingMaterials($event['id']);
            $data[$index]['has_missing_materials'] = !empty($eventMissingMaterials);
            $data[$index]['parks'] = $useMultipleParks ? Event::getParks($event['id']) : null;
        }

        return $response->withJson([ 'data' => $data ]);
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }
        return $response->withJson($this->_getFormattedEvent($id));
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
        $postData = $request->getParsedBody();
        $id = $this->_saveEvent(null, $postData);

        return $response->withJson($this->_getFormattedEvent($id), SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $postData = $request->getParsedBody();
        $id = $this->_saveEvent($id, $postData);

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
