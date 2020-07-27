<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;

use Robert2\API\Errors;
use Robert2\API\Models\Event;
use Robert2\API\Controllers\Traits\WithPdf;

class EventController extends BaseController
{
    use WithPdf;

    public function __construct($container)
    {
        parent::__construct($container);

        $this->model = new Event();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(Request $request, Response $response): Response
    {
        $startDate = $request->getQueryParam('start', null);
        $endDate = $request->getQueryParam('end', null);
        $deleted = (bool)$request->getQueryParam('deleted', false);

        $results = $this->model
            ->setPeriod($startDate, $endDate)
            ->getAll($deleted);

        $data = $results->get()->toArray();
        foreach ($data as $index => $event) {
            $eventMissingMaterials = $this->model->getMissingMaterials($event['id']);
            $data[$index]['has_missing_materials'] = !empty($eventMissingMaterials);
        }

        return $response->withJson([ 'data' => $data ]);
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $event = $this->model
            ->with('User')
            ->with('Assignees')
            ->with('Beneficiaries')
            ->with('Materials')
            ->with('Bills')
            ->find($id);

        if (!$event) {
            throw new Errors\NotFoundException;
        }

        return $response->withJson($this->_getResultWithBills($event));
    }

    public function getMissingMaterials(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!$this->model->exists($id)) {
            throw new Errors\NotFoundException;
        }

        $eventMissingMaterials = $this->model->getMissingMaterials($id);
        if (empty($eventMissingMaterials)) {
            return $response->withJson([]);
        }

        return $response->withJson($eventMissingMaterials);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function create(Request $request, Response $response): Response
    {
        $postData = $request->getParsedBody();
        $event = $this->_saveEvent(null, $postData);

        return $response->withJson($this->_getResultWithBills($event), SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->model->find($id);
        if (!$model) {
            throw new Errors\NotFoundException;
        }

        $postData = $request->getParsedBody();
        $event = $this->_saveEvent($id, $postData);

        return $response->withJson($this->_getResultWithBills($event), SUCCESS_OK);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Internal Methods
    // —
    // ——————————————————————————————————————————————————————

    protected function _saveEvent(?int $id, array $postData): Event
    {
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $result = $this->model->edit($id, $postData);

        if (isset($postData['beneficiaries'])) {
            $result->Beneficiaries()->sync($postData['beneficiaries']);
        }

        if (isset($postData['assignees'])) {
            $result->Assignees()->sync($postData['assignees']);
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
            $result->Materials()->sync($materials);
        }

        return $this->model
            ->with('User')
            ->with('Assignees')
            ->with('Beneficiaries')
            ->with('Materials')
            ->with('Bills')
            ->find($result->id);
    }

    protected function _getResultWithBills(Event $model): array
    {
        $result = $model->toArray();
        if (!$model->bills) {
            return $result;
        }

        $result['bills'] = $model->bills;
        return $result;
    }
}
