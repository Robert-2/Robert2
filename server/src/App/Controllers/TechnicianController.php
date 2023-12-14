<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Http\Request;
use Loxya\Models\Document;
use Loxya\Models\Event;
use Loxya\Models\EventTechnician;
use Loxya\Models\Technician;
use Loxya\Services\Auth;
use Loxya\Services\I18n;
use Loxya\Support\Period;
use Psr\Http\Message\ResponseInterface;
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

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $search = $request->getQueryParam('search', null);
        $isPreparer = $request->getQueryParam('isPreparer', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool) $request->getQueryParam('ascending', true);
        $availabilityPeriod = $request->getQueryParam('availabilityPeriod', null);
        $onlyDeleted = (bool) $request->getQueryParam('deleted', false);

        $orderBy = $request->getQueryParam('orderBy', null);
        if (!in_array($orderBy, ['full_name', 'email', 'nickname'], true)) {
            $orderBy = null;
        }

        // - Disponibilité dans une période donnée.
        $periodForAvailabilities = null;
        if ($availabilityPeriod !== null && is_array($availabilityPeriod)) {
            try {
                $periodForAvailabilities = Period::fromArray($availabilityPeriod);
            } catch (\Throwable $e) {
                $periodForAvailabilities = null;
            }
        }

        $builder = (new Technician())
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($search)
            ->getAll($onlyDeleted);

        if ($periodForAvailabilities !== null) {
            $builder = $builder->whereDoesntHave(
                'assignments',
                function ($query) use ($periodForAvailabilities) {
                    $query->where([
                        ['end_time', '>', $periodForAvailabilities->getStartDate()],
                        ['start_time', '<', $periodForAvailabilities->getEndDate()],
                    ]);
                }
            );
        }

        $paginated = $this->paginate($request, $builder, is_numeric($limit) ? (int) $limit : null);
        return $response->withJson($paginated, StatusCode::STATUS_OK);
    }

    public function getAllWhileEvent(Request $request, Response $response): ResponseInterface
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
                            ->where('deleted_at', null)
                            ->where([
                                ['end_date', '>=', $event->start_date],
                                ['start_date', '<=', $event->end_date],
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

    public function getEvents(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getAttribute('id');
        $technician = Technician::findOrFail($id);
        $assignments = $technician->assignments->each->setAppends(['event']);
        return $response->withJson($assignments, StatusCode::STATUS_OK);
    }

    public function getDocuments(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $technician = Technician::findOrFail($id);

        return $response->withJson($technician->documents, StatusCode::STATUS_OK);
    }

    public function attachDocument(Request $request, Response $response): ResponseInterface
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
