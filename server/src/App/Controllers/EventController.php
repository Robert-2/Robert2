<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Brick\Math\BigDecimal as Decimal;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Config\Config;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Errors\Exception\HttpConflictException;
use Loxya\Errors\Exception\HttpUnprocessableEntityException;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Loxya\Models\Document;
use Loxya\Models\Estimate;
use Loxya\Models\Event;
use Loxya\Models\EventMaterial;
use Loxya\Models\Invoice;
use Loxya\Models\Material;
use Loxya\Services\Auth;
use Loxya\Services\I18n;
use Loxya\Services\Logger;
use Loxya\Services\Mailer;
use Loxya\Services\View;
use Monolog\Level as LogLevel;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\UploadedFileInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

final class EventController extends BaseController
{
    use WithCrud;

    private I18n $i18n;
    protected Mailer $mailer;
    protected Logger $logger;

    public function __construct(Container $container, I18n $i18n, Mailer $mailer, Logger $logger)
    {
        parent::__construct($container);

        $this->i18n = $i18n;
        $this->mailer = $mailer;
        $this->logger = $logger;
    }

    // ------------------------------------------------------
    // -
    // -    Actions
    // -
    // ------------------------------------------------------

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $search = $request->getStringQueryParam('search');
        $exclude = $request->getIntegerQueryParam('exclude');

        $query = Event::query()
            ->when(
                $search !== null && strlen($search) >= 2,
                static fn ($builder) => $builder->search($search),
            )
            ->when($exclude !== null, static fn ($builder) => (
                $builder->where('id', '<>', $exclude)
            ))
            ->orderBy('mobilization_start_date', 'desc')
            ->whereHas('materials');

        return $response->withJson([
            'count' => $query->count(),
            'data' => $query
                ->limit(10)->get()
                ->map(static fn (Event $event) => (
                    $event->serialize(Event::SERIALIZE_SUMMARY)
                )),
        ]);
    }

    public function getMissingMaterials(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');

        $missingMaterials = Event::findOrFail($id)
            ->missingMaterials()
            ->map(static fn ($material) => (
                array_replace($material->serialize(), [
                    'pivot' => $material->pivot->serialize(
                        EventMaterial::SERIALIZE_WITH_QUANTITY_MISSING,
                    ),
                ])
            ));

        return $response->withJson($missingMaterials, StatusCode::STATUS_OK);
    }

    public function getDocuments(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        return $response->withJson($event->documents, StatusCode::STATUS_OK);
    }

    public function getReminders(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        return $response->withJson($event->reminders, StatusCode::STATUS_OK);
    }

    public function getOnePdf(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        $sortedBy = $request->getRawEnumQueryParam('sortedBy', ['lists', 'parks'], 'lists');
        $pdf = $event->toPdf($this->i18n, $sortedBy);

        return $pdf->asResponse($response);
    }

    public function create(Request $request, Response $response): ResponseInterface
    {
        $postData = Event::unserialize((array) $request->getParsedBody());
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        try {
            $event = Event::new(array_replace($postData, [
                'author_id' => Auth::user()->id,
            ]));
        } catch (ValidationException $e) {
            $errors = Event::serializeValidation($e->getValidationErrors());
            throw new ValidationException($errors);
        }

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_CREATED);
    }

    public function duplicate(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $originalEvent = Event::findOrFail($id);

        $postData = Event::unserialize((array) $request->getParsedBody());
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        try {
            $newEvent = $originalEvent->duplicate($postData, Auth::user());
        } catch (ValidationException $e) {
            $errors = Event::serializeValidation($e->getValidationErrors());
            throw new ValidationException($errors);
        }

        $data = $newEvent->serialize(Event::SERIALIZE_DETAILS);
        return $response->withJson($data, StatusCode::STATUS_CREATED);
    }

    public function updateDepartureInventory(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        if ($event->is_archived) {
            throw new HttpUnprocessableEntityException($request, "This event is archived.");
        }

        // - Si l'inventaire de départ est déjà terminé.
        if ($event->is_departure_inventory_done) {
            throw new HttpConflictException($request, "This event's departure inventory is already done.");
        }

        // - Si l'inventaire de départ ne peut pas encore être commencé.
        if (!$event->is_departure_inventory_period_open) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's departure inventory cannot be done yet."
            ));
        }

        // -  Si l'inventaire de retour ne peut plus être effectué.
        if ($event->is_departure_inventory_period_closed) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's departure inventory can no longer be done."
            ));
        }

        // - Si l'événement ne contient pas de matériel, il n'y a pas d'inventaire à faire.
        if ($event->materials->isEmpty()) {
            throw new HttpUnprocessableEntityException($request, (
                "This event contains no material, so there can be no inventory."
            ));
        }

        // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de départ.
        if ($event->has_missing_materials) {
            throw new HttpUnprocessableEntityException($request, (
                "This event contains shortage that should be fixed " .
                "before proceeding with the departure inventory."
            ));
        }

        $rawInventory = $request->getParsedBody();
        if (!is_array($rawInventory) && $rawInventory !== null) {
            throw new HttpBadRequestException($request, "Invalid data format.");
        }

        if (empty($rawInventory)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        try {
            $event->updateDepartureInventory($rawInventory);
        } catch (\InvalidArgumentException) {
            throw new HttpBadRequestException($request, "Invalid data format.");
        }

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function finishDepartureInventory(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        if ($event->is_archived) {
            throw new HttpUnprocessableEntityException($request, "This event is archived.");
        }

        // - Si l'inventaire de départ est déjà terminé.
        if ($event->is_departure_inventory_done) {
            throw new HttpConflictException($request, "This event's departure inventory is already done.");
        }

        // - Si l'inventaire de départ ne peut pas encore être commencé.
        if (!$event->is_departure_inventory_period_open) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's departure inventory cannot be done yet."
            ));
        }

        // -  Si l'inventaire de départ ne peut plus être effectué.
        if ($event->is_departure_inventory_period_closed) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's departure inventory can no longer be done."
            ));
        }

        // - Si l'événement ne contient pas de matériel, il n'y a pas d'inventaire à faire.
        if ($event->materials->isEmpty()) {
            throw new HttpUnprocessableEntityException($request, (
                "This event contains no material, so there can be no inventory."
            ));
        }

        // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de départ.
        if ($event->has_missing_materials) {
            throw new HttpUnprocessableEntityException($request, (
                "This event contains shortage that should be fixed " .
                "before proceeding with the departure inventory."
            ));
        }

        $rawInventory = $request->getParsedBody();
        if (!empty($rawInventory)) {
            if (!is_array($rawInventory)) {
                throw new HttpBadRequestException($request, "Invalid data format.");
            }

            try {
                $event->updateDepartureInventory($rawInventory);
            } catch (\InvalidArgumentException) {
                throw new HttpBadRequestException($request, "Invalid data format.");
            }
        }

        if (!$event->can_finish_departure_inventory) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's departure inventory cannot be marked as finished."
            ));
        }
        $event->finishDepartureInventory(Auth::user());

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function cancelDepartureInventory(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        if ($event->is_archived) {
            throw new HttpUnprocessableEntityException($request, "This event is archived.");
        }

        // - Si l'inventaire de départ n'est pas terminé, il n'y a rien à annuler.
        if (!$event->is_departure_inventory_done) {
            throw new HttpBadRequestException($request, "This event's departure inventory is not done.");
        }

        // - Si l'inventaire de retour est déjà terminé, on ne peut plus annuler l'inventaire de départ.
        if ($event->is_return_inventory_done) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's return inventory is already done, the departure inventory can no longer be cancelled."
            ));
        }

        // - Si le début de l'événement est dans le passé, on ne peut plus annuler l'inventaire de départ.
        if ($event->operation_period->getStartDate()->isPast()) {
            throw new HttpUnprocessableEntityException($request, (
                "This event has already started, the departure inventory can no longer be cancelled."
            ));
        }

        $event->cancelDepartureInventory();
        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function updateReturnInventory(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        if ($event->is_archived) {
            throw new HttpUnprocessableEntityException($request, "This event is archived.");
        }

        // - Si l'inventaire de retour est déjà terminé.
        if ($event->is_return_inventory_done) {
            throw new HttpConflictException($request, "This event's return inventory is already done.");
        }

        // - Si l'inventaire de retour ne peut pas encore être commencé.
        if (!$event->is_return_inventory_period_open) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's return inventory cannot be done yet."
            ));
        }

        // - Si l'événement ne contient pas de matériel, il n'y a pas d'inventaire à faire.
        if ($event->materials->isEmpty()) {
            throw new HttpUnprocessableEntityException($request, (
                "This event contains no material, so there can be no inventory."
            ));
        }

        // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        if ($event->has_missing_materials) {
            throw new HttpUnprocessableEntityException($request, (
                "This event contains shortage that should be fixed " .
                "before proceeding with the return inventory."
            ));
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
        } catch (\InvalidArgumentException) {
            throw new HttpBadRequestException($request, "Invalid data format.");
        }

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function finishReturnInventory(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        if ($event->is_archived) {
            throw new HttpUnprocessableEntityException($request, "This event is archived.");
        }

        // - Si l'inventaire de retour est déjà terminé.
        if ($event->is_return_inventory_done) {
            throw new HttpConflictException($request, "This event's return inventory is already done.");
        }

        // - Si l'inventaire de retour ne peut pas encore être commencé.
        if (!$event->is_return_inventory_period_open) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's return inventory cannot be done yet."
            ));
        }

        // - Si l'événement ne contient pas de matériel, il n'y a pas d'inventaire à faire.
        if ($event->materials->isEmpty()) {
            throw new HttpUnprocessableEntityException($request, (
                "This event contains no material, so there can be no inventory."
            ));
        }

        // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        if ($event->has_missing_materials) {
            throw new HttpUnprocessableEntityException($request, (
                "This event contains shortage that should be fixed " .
                "before proceeding with the return inventory."
            ));
        }

        $rawInventory = $request->getParsedBody();
        if (!empty($rawInventory)) {
            if (!is_array($rawInventory)) {
                throw new HttpBadRequestException($request, "Invalid data format.");
            }

            try {
                $event->updateReturnInventory($rawInventory);
            } catch (\InvalidArgumentException) {
                throw new HttpBadRequestException($request, "Invalid data format.");
            }
        }

        if (!$event->can_finish_return_inventory) {
            throw new HttpUnprocessableEntityException($request, (
                "This event's return inventory cannot be marked as finished."
            ));
        }
        $event->finishReturnInventory(Auth::user());

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function notifyAboutReturnInventory(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        if ($event->is_archived) {
            throw new HttpUnprocessableEntityException($request, "This event is archived.");
        }

        // - Si l'inventaire est terminé, on ne peut plus notifier.
        //   (lorsque l'on termine, on acte le fait que l'inventaire ne bougera
        //   plus et donc qu'il ne pourra plus y avoir de retour, c'est donc inutile
        //   de notifier qui que ce soit)
        if ($event->is_return_inventory_done) {
            throw new HttpBadRequestException($request, "This event's return inventory is already done.");
        }

        // - Si l'inventaire de retour n'est pas encore ouvert, on ne peut pas notifier à son propos.
        if (!$event->is_return_inventory_period_open) {
            throw new HttpUnprocessableEntityException($request, "This event's return inventory cannot be done yet.");
        }

        $eventFiltered = tap($event, static function (Event $rawEvent) {
            $rawEvent->setRelation(
                'materials',
                $rawEvent->materials->filter(static fn (Material $material) => (
                    ($material->pivot->quantity - ($material->pivot->quantity_returned ?? 0)) > 0
                )),
            );
        });

        // - Si l'inventaire est complet, pas besoin de notification.
        if ($eventFiltered->materials->isEmpty()) {
            throw new HttpBadRequestException($request, "All materials of this event are returned.");
        }

        // - Si pas de technicians, pas de notification.
        if ($event->technicians->isEmpty()) {
            throw new HttpBadRequestException($request, "This event has no technician assigned.");
        }

        $data = [
            'company' => Config::get('companyData'),
            'event' => $eventFiltered,
        ];

        $sentCount = 0;
        foreach ($event->technicians as $technician) {
            $email = $technician->technician->email;
            if (empty($email)) {
                continue;
            }

            $subject = $this->i18n->translate('not-returned-materials-notification');
            $message = (new View($this->i18n, 'emails'))
                ->fetch('notifications/not-returned/event-technician', $data);
            $this->mailer->send($email, $subject, $message);
            $sentCount += 1;
        }

        return $response->withJson($sentCount, StatusCode::STATUS_CREATED);
    }

    public function cancelReturnInventory(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        if ($event->is_archived) {
            throw new HttpUnprocessableEntityException($request, "This event is archived.");
        }

        // - Si l'inventaire de retour n'est pas terminé, il n'y a rien à annuler.
        if (!$event->is_return_inventory_done) {
            throw new HttpBadRequestException($request, "This event's return inventory is not done.");
        }

        // - S'il n'y a pas de matériel cassé, on permet l'annulation de
        //   l'inventaire quelque soit le moment ou il a été terminé.
        //   Sinon, l'inventaire est annulable pendant 1 semaine après
        //   l'avoir marqué comme terminé.
        if ($event->has_materials_returned_broken) {
            $isCancellable = (
                $event->return_inventory_datetime !== null &&
                CarbonImmutable::parse($event->return_inventory_datetime)
                    ->isAfter(Carbon::now()->subWeek())
            );
            if (!$isCancellable) {
                throw new HttpUnprocessableEntityException($request, (
                    "This event's return inventory can no longer been cancelled."
                ));
            }
        }

        $event->cancelReturnInventory();
        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function createEstimate(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
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
        $id = $request->getIntegerAttribute('id');
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
        $id = $request->getIntegerAttribute('id');
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
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        $event->is_archived = true;
        $event->save();

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function unarchive(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::findOrFail($id);

        $event->is_archived = false;
        $event->save();

        return $response->withJson(static::_formatOne($event), StatusCode::STATUS_OK);
    }

    public function delete(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $event = Event::withTrashed()
            ->orWhere(static function ($query) {
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

    public function sendSummaryToTechnicians(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');

        $event = Event::findOrFail($id);
        if ($event->technicians->isEmpty()) {
            throw new HttpUnprocessableEntityException($request, "No technician to send summary to.");
        }

        $data = [
            'event' => $event,
            'company' => Config::get('companyData'),
        ];
        $subject = $this->i18n->translate('event-summary', [$event->title]);
        $message = (new View($this->i18n, 'emails'))->fetch('bookings/event/summary', $data);
        $pdf = $event->toPdf($this->i18n);
        $attachments = [
            [
                'content' => $pdf->getContent(),
                'filename' => $pdf->getName(),
                'mimeType' => 'application/pdf',
            ],
        ];

        $sentCount = 0;
        foreach ($event->technicians as $technician) {
            $email = $technician->technician->email;
            if (empty($email)) {
                continue;
            }

            try {
                $this->mailer->send($email, $subject, $message, $attachments);
                $sentCount += 1;
            } catch (\Throwable $e) {
                $this->logger->log(LogLevel::Error, vsprintf(
                    "[Event] Failed to send event #%s's summary to technician (%s). %s",
                    [$event->id, $email, $e->getMessage()],
                ));
            }
        }

        return $response->withJson($sentCount, StatusCode::STATUS_OK);
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
