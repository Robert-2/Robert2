<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Http\Request;
use Robert2\API\Models\Document;
use Robert2\API\Models\Event;
use Robert2\API\Models\EventTechnician;
use Robert2\API\Models\Technician;
use Robert2\API\Services\Auth;
use Robert2\API\Services\I18n;
use Robert2\Support\Arr;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

class TechnicianController extends BaseController
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

    public function getAll(Request $request, Response $response): Response
    {
        $searchTerm = $request->getQueryParam('search', null);
        $searchField = $request->getQueryParam('searchBy', null);
        $orderBy = $request->getQueryParam('orderBy', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool) $request->getQueryParam('ascending', true);
        $withDeleted = (bool) $request->getQueryParam('deleted', false);

        // - Disponibilité dans une période donnée.
        $availabilityPeriod = Arr::mapKeys(
            function ($key) use ($request) {
                $rawDate = $request->getQueryParam(sprintf('%sDate', $key));
                if (!$rawDate) {
                    return null;
                }

                $date = \DateTime::createFromFormat('Y-m-d', $rawDate);
                if (!$date) {
                    return null;
                }

                $date = $key === 'end'
                    ? $date->setTime(23, 59, 59)
                    : $date->setTime(0, 0, 0);

                return $date->format('Y-m-d H:i:s');
            },
            array_fill_keys(['start', 'end'], null),
        );

        $builder = (new Technician())
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField)
            ->getAll($withDeleted);

        if ($availabilityPeriod['start'] && $availabilityPeriod['end']) {
            $builder = $builder->whereDoesntHave(
                'assignments',
                function ($query) use ($availabilityPeriod) {
                    $query->where([
                        ['end_time', '>', $availabilityPeriod['start']],
                        ['start_time', '<', $availabilityPeriod['end']],
                    ]);
                }
            );
        }

        $paginated = $this->paginate($request, $builder, is_numeric($limit) ? (int) $limit : null);
        return $response->withJson($paginated, StatusCode::STATUS_OK);
    }

    public function getAllWhileEvent(Request $request, Response $response): Response
    {
        $eventId = (int) $request->getAttribute('eventId');
        $event = Event::findOrFail($eventId);

        $technicians = (new Technician)
            ->getAll()
            ->get()
            ->map(function ($technician) use ($event) {
                $events = $technician->assignments()
                    ->whereHas('event', function ($query) use ($event) {
                        $query
                            ->where('id', '!=', $event->id)
                            ->where([
                                ['end_date', '>', $event->start_date],
                                ['start_date', '<', $event->end_date],
                            ]);
                    })
                    ->get()
                    ->map(fn($eventTechnician) => (
                        $eventTechnician->serialize(EventTechnician::SERIALIZE_DETAILS)
                    ))
                    ->all();

                return array_replace($technician->serialize(), compact('events'));
            })
            ->all();

        return $response->withJson($technicians, StatusCode::STATUS_OK);
    }

    public function getEvents(Request $request, Response $response): Response
    {
        $id = $request->getAttribute('id');
        $technician = Technician::findOrFail($id);
        $assignments = $technician->assignments->each->setAppends(['event']);
        return $response->withJson($assignments, StatusCode::STATUS_OK);
    }

    public function getDocuments(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $technician = Technician::findOrFail($id);

        return $response->withJson($technician->documents, StatusCode::STATUS_OK);
    }

    public function attachDocument(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
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
