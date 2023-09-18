<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Brick\Math\BigDecimal as Decimal;
use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Errors\Exception\HttpConflictException;
use Loxya\Errors\Exception\HttpUnprocessableEntityException;
use Loxya\Http\Request;
use Loxya\Models\Document;
use Loxya\Models\Estimate;
use Loxya\Models\Event;
use Loxya\Models\Invoice;
use Loxya\Services\Auth;
use Loxya\Services\I18n;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

class EventController extends BaseController
{
    use WithCrud;

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

    public function getAll(Request $request, Response $response): ResponseInterface
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

    public function getMissingMaterials(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');

        $missingMaterials = Event::findOrFail($id)->missingMaterials()
            ->map(fn($material) => (
                array_replace($material->serialize(), [
                    'pivot' => $material->pivot
                        ->append('quantity_missing')
                        ->serialize(),
                ])
            ));

        return $response->withJson($missingMaterials, StatusCode::STATUS_OK);
    }

    public function getDocuments(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        return $response->withJson($event->documents, StatusCode::STATUS_OK);
    }

    public function getOnePdf(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        $sortedBy = $request->getQueryParam('sortedBy', 'lists');
        $pdf = $event->toPdf($this->i18n, $sortedBy);

        return $pdf->asResponse($response);
    }

    public function create(Request $request, Response $response): ResponseInterface
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $event = Event::new(array_replace($postData, [
            'author_id' => Auth::user()->id,
        ]));

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_CREATED);
    }

    public function duplicate(Request $request, Response $response): ResponseInterface
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

    public function updateReturnInventory(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        // - Si l'inventaire de retour est déjà terminé.
        if ($event->is_return_inventory_done) {
            throw new HttpConflictException($request, "This event's return inventory is already done.");
        }

        // - Si l'inventaire de retour ne peut pas encore être commencé.
        if (!$event->can_do_return_inventory) {
            throw new HttpUnprocessableEntityException($request, "This event's return inventory cannot be done yet.");
        }

        $rawInventory = $request->getParsedBody();
        if (!is_array($rawInventory) && $rawInventory !== null) {
            throw new HttpBadRequestException($request, "Invalid data format.");
        }

        if (empty($rawInventory)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        try {
            $event->updateReturnInventory($rawInventory);
        } catch (\InvalidArgumentException $e) {
            throw new HttpBadRequestException($request, "Invalid data format.");
        }

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function finishReturnInventory(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        // - Si l'inventaire de retour est déjà terminé.
        if ($event->is_return_inventory_done) {
            throw new HttpConflictException($request, "This event's return inventory is already done.");
        }

        // - Si l'inventaire de retour ne peut pas encore être commencé.
        if (!$event->can_do_return_inventory) {
            throw new HttpUnprocessableEntityException($request, "This event's return inventory cannot be done yet.");
        }

        $rawInventory = $request->getParsedBody();
        if (!empty($rawInventory)) {
            if (!is_array($rawInventory)) {
                throw new HttpBadRequestException($request, "Invalid data format.");
            }

            try {
                $event->updateReturnInventory($rawInventory);
            } catch (\InvalidArgumentException $e) {
                throw new HttpBadRequestException($request, "Invalid data format.");
            }
        }

        if (!$event->can_finish_return_inventory) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's return inventory cannot be marked as finished yet."
            ));
        }
        $event->finishReturnInventory();

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function createEstimate(Request $request, Response $response): ResponseInterface
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

    public function createInvoice(Request $request, Response $response): ResponseInterface
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

    public function attachDocument(Request $request, Response $response): ResponseInterface
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

    public function archive(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        $event->is_archived = true;
        $event->save();

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function unarchive(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::findOrFail($id);

        $event->is_archived = false;
        $event->save();

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function delete(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $event = Event::withTrashed()
            ->orWhere(function ($query) {
                $query
                    ->where('is_confirmed', false)
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

    protected static function _formatOne(Event $event): array
    {
        return $event->serialize(Event::SERIALIZE_DETAILS);
    }
}
