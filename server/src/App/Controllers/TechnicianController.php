<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\Builder;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Http\Request;
use Loxya\Models\Document;
use Loxya\Models\Event;
use Loxya\Models\EventTechnician;
use Loxya\Models\Technician;
use Loxya\Services\Auth;
use Loxya\Services\I18n;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\UploadedFileInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

final class TechnicianController extends BaseController
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
        $search = $request->getStringQueryParam('search');
        $limit = $request->getIntegerQueryParam('limit');
        $ascending = $request->getBooleanQueryParam('ascending', true);
        $availabilityPeriod = $request->getPeriodQueryParam('availabilityPeriod');
        $onlyDeleted = $request->getBooleanQueryParam('deleted', false);
        $orderBy = $request->getOrderByQueryParam('orderBy', Technician::class);

        $query = Technician::query()
            ->when(
                $search !== null && mb_strlen($search) >= 2,
                static fn (Builder $subQuery) => $subQuery->search($search),
            )
            ->when(
                $availabilityPeriod !== null,
                static fn (Builder $subQuery) => (
                    $subQuery->whereDoesntHave('assignments', (
                        static function (Builder $subSubQuery) use ($availabilityPeriod) {
                            /** @var Builder|EventTechnician $subSubQuery */
                            $subSubQuery->inPeriod($availabilityPeriod);
                        }
                    ))
                ),
            )
            ->when($onlyDeleted, static fn (Builder $subQuery) => (
                $subQuery->onlyTrashed()
            ))
            ->customOrderBy($orderBy, $ascending ? 'asc' : 'desc');

        $results = $this->paginate($request, $query, $limit);
        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getAllWhileEvent(Request $request, Response $response): ResponseInterface
    {
        $eventId = $request->getIntegerAttribute('eventId');
        $event = Event::findOrFail($eventId);

        $technicians = Technician::query()
            ->customOrderBy('full_name')->get()
            ->map(static function ($technician) use ($event) {
                $events = $technician->assignments()
                    ->whereHas('event', static function (Builder $query) use ($event) {
                        /** @var Builder|Event $query */
                        $query
                            ->inPeriod($event)
                            ->where('id', '!=', $event->id)
                            ->where('deleted_at', null);
                    })
                    ->get()
                    ->map(static fn (EventTechnician $eventTechnician) => (
                        $eventTechnician->serialize(
                            EventTechnician::SERIALIZE_FOR_TECHNICIAN,
                        )
                    ))
                    ->all();

                return array_replace($technician->serialize(), compact('events'));
            })
            ->all();

        return $response->withJson($technicians, StatusCode::STATUS_OK);
    }

    public function getEvents(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getAttribute('id');
        $technician = Technician::findOrFail($id);

        $data = $technician->assignments
            ->whereNull('event.deleted_at')
            ->values()
            ->map(
                static fn (EventTechnician $eventTechnician) => (
                    $eventTechnician->serialize(
                        EventTechnician::SERIALIZE_FOR_TECHNICIAN,
                    )
                )
            );

        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    public function getDocuments(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $technician = Technician::findOrFail($id);

        return $response->withJson($technician->documents, StatusCode::STATUS_OK);
    }

    public function attachDocument(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $technician = Technician::findOrFail($id);

        /** @var UploadedFileInterface[] $uploadedFiles */
        $uploadedFiles = $request->getUploadedFiles();
        if (count($uploadedFiles) !== 1) {
            throw new HttpBadRequestException($request, "Invalid number of files sent: a single file is expected.");
        }

        $file = array_values($uploadedFiles)[0];
        $document = new Document(compact('file'));
        $document->author()->associate(Auth::user());
        $technician->documents()->save($document);

        return $response->withJson($document, StatusCode::STATUS_CREATED);
    }
}
