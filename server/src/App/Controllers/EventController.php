<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Brick\Math\BigDecimal as Decimal;
use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Errors\Exception\ValidationException;
use Robert2\API\Http\Request;
use Robert2\API\Models\Document;
use Robert2\API\Models\Estimate;
use Robert2\API\Models\Event;
use Robert2\API\Models\Invoice;
use Robert2\API\Models\Material;
use Robert2\API\Services\Auth;
use Robert2\API\Services\I18n;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;

class EventController extends BaseController
{
    use WithCrud;
    use WithPdf;

    private I18n $i18n;

    public function __construct(Container $container, I18n $i18n)
    {
        parent::__construct($container);

        $this->i18n = $i18n;
    }

    // ------------------------------------------------------
    // -
    // -    Actions
    // -
    // ------------------------------------------------------

    public function getAll(Request $request, Response $response): Response
    {
        $search = $request->getQueryParam('search', null);
        $exclude = $request->getQueryParam('exclude', null);

        $query = Event::query()
            ->when($search !== null, fn ($builder) => (
                $builder->search($search)
            ))
            ->when($exclude !== null, fn ($builder) => (
                $builder->where('id', '<>', $exclude)
            ))
            ->orderBy('start_date', 'desc')
            ->whereHas('materials');

        return $response->withJson([
            'count' => $query->count(),
            'data' => $query->limit(10)->get()->map(fn (Event $event) => (
                $event->serialize(Event::SERIALIZE_SUMMARY)
            )),
        ]);
    }

    public function getMissingMaterials(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');

        $missingMaterials = Event::findOrFail($id)->missingMaterials()
            ->map(fn($material) => (
                array_replace($material->serialize(), [
                    'pivot' => $material->pivot
                        ->append('quantity_missing')
                        ->toArray(),
                ])
            ));

        return $response->withJson($missingMaterials, StatusCode::STATUS_OK);
    }

    public function getDocuments(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        return $response->withJson($event->documents, StatusCode::STATUS_OK);
    }

    public function create(Request $request, Response $response): Response
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        if (!isset($postData['user_id'])) {
            $postData['user_id'] = Auth::user()->id;
        }

        $event = Event::new($postData);
        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_CREATED);
    }

    public function duplicate(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $originalEvent = Event::findOrFail($id);

        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $newEvent = $originalEvent->duplicate($postData, Auth::user());

        $data = $newEvent->serialize(Event::SERIALIZE_DETAILS);
        return $response->withJson($data, StatusCode::STATUS_CREATED);
    }

    public function updateReturnInventory(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $postData = (array) $request->getParsedBody();
        $this->_saveReturnInventory($id, $postData);

        $event = Event::findOrFail($id);
        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function finishReturnInventory(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $postData = (array) $request->getParsedBody();
        dbTransaction(function () use ($id, $postData) {
            $this->_saveReturnInventory($id, $postData);

            Event::staticEdit($id, [
                'is_confirmed' => true,
                'is_return_inventory_done' => true,
            ]);

            $this->_setBrokenMaterialsQuantities($postData);
        });

        $event = Event::findOrFail($id);
        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function createEstimate(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        $discountRate = $request->getParsedBodyParam('discountRate', 0);
        $event->discount_rate = is_numeric($discountRate)
            ? Decimal::of($discountRate)
            : Decimal::zero();

        $estimate = Estimate::createFromBooking($event, Auth::user());
        return $response->withJson($estimate, StatusCode::STATUS_CREATED);
    }

    public function createInvoice(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        $discountRate = $request->getParsedBodyParam('discountRate', 0);
        $event->discount_rate = is_numeric($discountRate)
            ? Decimal::of($discountRate)
            : Decimal::zero();

        $invoice = Invoice::createFromBooking($event, Auth::user());
        return $response->withJson($invoice, StatusCode::STATUS_CREATED);
    }

    public function attachDocument(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        /** @var UploadedFileInterface[] $uploadedFiles */
        $uploadedFiles = $request->getUploadedFiles();
        if (count($uploadedFiles) !== 1) {
            throw new HttpBadRequestException($request, "Invalid number of files sent: a single file is expected.");
        }

        $file = array_values($uploadedFiles)[0];
        $document = new Document(compact('file'));
        $document->author()->associate(Auth::user());
        $event->documents()->save($document);

        return $response->withJson($document, StatusCode::STATUS_CREATED);
    }

    public function archive(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        $event->is_archived = true;
        $event->save();

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function unarchive(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        $event->is_archived = false;
        $event->save();

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::withTrashed()
            ->orWhere(function ($query) {
                $query->where('is_confirmed', false)
                    ->where('is_return_inventory_done', false);
            })
            ->findOrFail($id);

        $isDeleted = $event->trashed()
            ? $event->forceDelete()
            : $event->delete();

        if (!$isDeleted) {
            throw new \RuntimeException("An unknown error occurred while deleting the event.");
        }

        return $response->withStatus(StatusCode::STATUS_NO_CONTENT);
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _saveReturnInventory(int $id, array $data): void
    {
        $event = Event::find($id);
        $eventMaterials = $event->materials
            ->keyBy('id')
            ->all();

        $quantities = [];
        $errors = [];
        foreach ($data as $quantity) {
            if (!array_key_exists('id', $quantity)) {
                continue;
            }

            $materialId = $quantity['id'];
            $addError = function ($message) use ($materialId, &$errors) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => $this->i18n->translate($message),
                ];
            };

            if (!array_key_exists($materialId, $eventMaterials)) {
                continue;
            }
            $material = $eventMaterials[$materialId];

            if (!array_key_exists('actual', $quantity) || !is_integer($quantity['actual'])) {
                $addError('returned-quantity-not-valid');
                continue;
            }
            $actual = (int) $quantity['actual'];

            if (!array_key_exists('broken', $quantity) || !is_integer($quantity['broken'])) {
                $addError('broken-quantity-not-valid');
                continue;
            }
            $broken = (int) $quantity['broken'];

            if ($actual < 0 || $broken < 0) {
                $addError('quantities-cannot-be-negative');
                continue;
            }

            if ($actual > $material->pivot->quantity) {
                $addError('returned-quantity-cannot-be-greater-than-output-quantity');
                continue;
            }

            if ($broken > $actual) {
                $addError('broken-quantity-cannot-be-greater-than-returned-quantity');
                continue;
            }

            $quantities[$materialId] = [
                'quantity_returned' => $actual,
                'quantity_returned_broken' => $broken,
            ];
        }

        if (!empty($errors)) {
            throw new ValidationException($errors);
        }

        $event->materials()->sync($quantities);
    }

    protected function _setBrokenMaterialsQuantities(array $data): void
    {
        foreach ($data as $quantities) {
            $broken = (int) $quantities['broken'];
            if ($broken === 0) {
                continue;
            }

            $material = Material::find($quantities['id']);
            if (!$material) {
                continue;
            }

            // FIXME: Cette façon de faire n'est pas safe car si le matériel sortie
            //        - non unitaire - était du matériel externe, on le compte comme
            //        cassé dans le stock réel...
            $material->out_of_order_quantity += (int) $quantities['broken'];
            $material->save();
        }
    }

    protected static function _formatOne(Event $event): array
    {
        return $event->serialize(Event::SERIALIZE_DETAILS);
    }
}
