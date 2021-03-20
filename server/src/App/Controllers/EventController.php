<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Errors;
use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Middlewares\Auth;
use Robert2\API\Models\Park;
use Robert2\API\Models\Material;
use Robert2\API\Models\MaterialUnit;
use Robert2\API\Models\Event;
use Slim\Http\Request;
use Slim\Http\Response;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class EventController extends BaseController
{
    use WithPdf;

    /** @var Event */
    protected $model;

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

        $restrictedParks = Auth::user()->restricted_parks;
        $useMultipleParks = Park::count() > 1;

        $data = [];
        $events = $results->get()->toArray();
        foreach ($events as $event) {
            $eventMissingMaterials = $this->model->getMissingMaterials($event['id']);
            $event['has_missing_materials'] = !empty($eventMissingMaterials);
            $event['parks'] = null;

            if ($useMultipleParks) {
                $event['parks'] = $this->model->getParks($event['id']);

                $parksCount = count($event['parks']);
                $intersectCount = count(array_intersect($restrictedParks, $event['parks']));
                if ($parksCount > 0 && $parksCount === $intersectCount) {
                    continue;
                }
            }
            $data[] = $event;
        }

        return $response->withJson(compact('data'));
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!$this->model->exists($id)) {
            throw new Errors\NotFoundException;
        }
        return $response->withJson($this->_getFormattedEvent($id));
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
        $id = $this->_saveEvent(null, $postData);

        return $response->withJson($this->_getFormattedEvent($id), SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->model->find($id);
        if (!$model) {
            throw new Errors\NotFoundException;
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

        $event = $this->model->edit($id, $postData);

        if (isset($postData['beneficiaries'])) {
            $event->Beneficiaries()->sync($postData['beneficiaries']);
        }

        if (isset($postData['assignees'])) {
            $event->Assignees()->sync($postData['assignees']);
        }

        // - Unités déjà utilisées auparavant dans l'événement.
        $existingUnits = [];
        foreach ($event->Materials()->get() as $material) {
            $existingUnits = array_merge($existingUnits, $material->pivot->units);
        }

        // - Unités utilisées au moment de l'événement (dans les autres événements).
        $concurrentlyUsedUnits = $event->getConcurrentlyUsedUnits();

        if (isset($postData['materials'])) {
            $materials = [];
            $materialsUnits = [];
            foreach ($postData['materials'] as $materialData) {
                if ((int)$materialData['quantity'] <= 0) {
                    continue;
                }

                try {
                    $material = Material::findOrFail($materialData['id']);

                    $unitIds = [];
                    if ($material->is_unitary && !empty($materialData['units'])) {
                        $unitIds = $materialData['units'];
                        if (!is_array($unitIds)) {
                            throw new \InvalidArgumentException(
                                sprintf(
                                    "Le format des unités selectionnées pour le matériel ref. \"%s\" est invalide.",
                                    $material->reference
                                ),
                                ERROR_VALIDATION
                            );
                        }

                        foreach ($unitIds as $unitId) {
                            $unit = MaterialUnit::findOrFail($unitId);
                            if ($unit->material_id !== $material->id) {
                                throw new \InvalidArgumentException(
                                    vsprintf(
                                        "L'unité ref. \"%s\", séléctionnée pour le matériel " .
                                        "ref. \"%s\" n'appartient pas à celui-ci.",
                                        [$unit->serial_number, $material->reference]
                                    ),
                                    ERROR_VALIDATION
                                );
                            }

                            // - Si l'unité était déjà sauvée pour l'événement, on bypass les autres vérifs.
                            if (in_array($unit->id, $existingUnits, true)) {
                                continue;
                            }

                            // NOTE: On n'empêche pas le save des unités `is_broken` car si l'utilisateur final
                            // souhaite quand même les placer dans un événement, libre à lui.
                            if (in_array($unit->id, $concurrentlyUsedUnits, true)) {
                                throw new \InvalidArgumentException(
                                    vsprintf(
                                        "L'unité ref. \"%s\", séléctionnée pour le matériel " .
                                        "ref. \"%s\" n'est pas disponible à cette période.",
                                        [$unit->serial_number, $material->reference]
                                    ),
                                    ERROR_VALIDATION
                                );
                            }
                        }
                    }

                    $materialsUnits[$materialData['id']] = $unitIds;
                    $materials[$materialData['id']] = [
                        'quantity' => $materialData['quantity']
                    ];
                } catch (ModelNotFoundException $e) {
                    throw new \InvalidArgumentException(
                        "Un ou plusieurs matériels (ou des unités de ceux-ci) ajoutés à l'événement n'existent pas.",
                        ERROR_VALIDATION
                    );
                }
            }

            $event->Materials()->sync($materials);

            // - Synchronisation des unités.
            $materials = $event->Materials()->get();
            foreach ($materials as $material) {
                $units = $materialsUnits[$material->id] ?? [];
                $material->pivot->Units()->sync($units);
            }
        }

        return $event->id;
    }

    protected function _getFormattedEvent(int $id): array
    {
        $model = $this->model
            ->with('User')
            ->with('Assignees')
            ->with('Beneficiaries')
            ->with('Materials')
            ->with('Bills')
            ->find($id);

        $result = $model->toArray();
        if (!$model->bills) {
            return $result;
        }

        $result['bills'] = $model->bills;
        return $result;
    }
}
