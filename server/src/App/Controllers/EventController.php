<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Models\Event;
use Robert2\API\Models\Material;
use Robert2\API\Models\MaterialUnit;
use Robert2\API\Models\Park;
use Robert2\API\Services\Auth;
use Robert2\API\Errors\ValidationException;
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
        $startDate = $request->getQueryParam('start', null);
        $endDate = $request->getQueryParam('end', null);
        $deleted = (bool)$request->getQueryParam('deleted', false);

        $results = (new Event)
            ->setPeriod($startDate, $endDate)
            ->getAll($deleted)
            ->with('Beneficiaries:persons.id,first_name,last_name')
            ->with('Assignees:persons.id,first_name,last_name');

        $restrictedParks = Auth::user()->restricted_parks;
        $useMultipleParks = Park::count() > 1;

        $data = [];
        $events = $results->get()->toArray();
        $today = (new \DateTime())->setTime(0, 0, 0);
        foreach ($events as $event) {
            $event['has_missing_materials'] = null;
            $event['has_not_returned_materials'] = null;

            $eventEndDate = new \DateTime($event['end_date']);
            if ($eventEndDate >= $today) {
                $eventMissingMaterials = Event::getMissingMaterials($event['id']);
                $event['has_missing_materials'] = !empty($eventMissingMaterials);
            } elseif ($event['is_return_inventory_done']) {
                $event['has_not_returned_materials'] = Event::hasNotReturnedMaterials($event['id']);
            }

            $event['parks'] = null;
            if ($useMultipleParks) {
                $event['parks'] = Event::getParks($event['id']);

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
                                    "Le format des unités sélectionnées pour le matériel ref. \"%s\" est invalide.",
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
                                        "L'unité ref. \"%s\", sélectionnée pour le matériel " .
                                        "ref. \"%s\" n'appartient pas à celui-ci.",
                                        [$unit->reference, $material->reference]
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
                                        "L'unité ref. \"%s\", sélectionnée pour le matériel " .
                                        "ref. \"%s\" n'est pas disponible à cette période.",
                                        [$unit->reference, $material->reference]
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
