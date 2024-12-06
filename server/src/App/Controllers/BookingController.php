<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Loxya\Errors\Enums\ApiErrorCode;
use Loxya\Errors\Exception\ApiBadRequestException;
use Loxya\Errors\Exception\HttpUnprocessableEntityException;
use Loxya\Http\Request;
use Loxya\Models\Enums\Group;
use Loxya\Models\Event;
use Loxya\Models\Park;
use Loxya\Services\Auth;
use Loxya\Services\Logger;
use Loxya\Services\Mailer;
use Loxya\Support\Database\QueryAggregator;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;

final class BookingController extends BaseController
{
    public const MAX_GET_ALL_PERIOD = 3.5 * 30; // - En jours
    public const MAX_GET_ALL_PER_PAGE = 30;

    public const BOOKING_TYPES = [
        Event::TYPE => Event::class,
    ];

    protected Mailer $mailer;
    protected Logger $logger;

    public function __construct(Container $container, Mailer $mailer, Logger $logger)
    {
        parent::__construct($container);

        $this->mailer = $mailer;
        $this->logger = $logger;
    }

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        if ($request->getBooleanQueryParam('paginated', true)) {
            return $this->getAllPaginated($request, $response);
        }

        return $this->getAllInPeriod($request, $response);
    }

    public function getOneSummary(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $entity = $request->getAttribute('entity');
        if (!array_key_exists($entity, self::BOOKING_TYPES)) {
            throw new HttpNotFoundException($request, "Booking type (entity) not recognized.");
        }

        /** @var Event $booking */
        $booking = self::BOOKING_TYPES[$entity]::findOrFailForUser($id, Auth::user());

        $useMultipleParks = Park::count() > 1;

        $data = array_replace(
            $booking->serialize($booking::SERIALIZE_BOOKING_SUMMARY),
            [
                'parks' => $useMultipleParks
                    ? array_values($booking->parks)
                    : [],
            ],
        );

        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    public function getOne(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $entity = $request->getAttribute('entity');
        if (!array_key_exists($entity, self::BOOKING_TYPES)) {
            throw new HttpNotFoundException($request, "Booking type (entity) not recognized.");
        }

        /** @var Event $booking */
        $booking = self::BOOKING_TYPES[$entity]::findOrFailForUser($id, Auth::user());

        $data = $booking->serialize($booking::SERIALIZE_BOOKING_DEFAULT);
        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    public function updateMaterials(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $entity = $request->getAttribute('entity');
        if (!array_key_exists($entity, self::BOOKING_TYPES)) {
            throw new HttpNotFoundException($request, "Booking type (entity) not recognized.");
        }

        /** @var Event $booking */
        $booking = self::BOOKING_TYPES[$entity]::findOrFail($id);

        if (!$booking->is_editable) {
            throw new HttpUnprocessableEntityException($request, "This booking is no longer editable.");
        }

        $rawMaterials = $request->getParsedBody();
        if (!is_array($rawMaterials)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        try {
            $booking->syncMaterials($rawMaterials);
        } catch (\LengthException $e) {
            throw new ApiBadRequestException(ApiErrorCode::EMPTY_PAYLOAD, $e->getMessage());
        } catch (\InvalidArgumentException $e) {
            throw new HttpBadRequestException($request, $e->getMessage());
        }

        $data = $booking->serialize($booking::SERIALIZE_BOOKING_DEFAULT);
        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    public function updateBilling(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $entity = $request->getAttribute('entity');
        if (!array_key_exists($entity, self::BOOKING_TYPES)) {
            throw new HttpNotFoundException($request, "Booking type (entity) not recognized.");
        }

        /** @var Event $booking */
        $booking = self::BOOKING_TYPES[$entity]::findOrFail($id);

        if (!$booking->is_editable) {
            throw new HttpUnprocessableEntityException($request, "This booking is no longer editable.");
        }

        $rawBillingData = $request->getParsedBody();
        if (!is_array($rawBillingData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        try {
            $booking->syncBilling($rawBillingData);
        } catch (\InvalidArgumentException $e) {
            throw new HttpBadRequestException($request, $e->getMessage());
        }

        $data = $booking->serialize($booking::SERIALIZE_BOOKING_DEFAULT);
        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function getAllPaginated(Request $request, Response $response): ResponseInterface
    {
        $orderBy = $request->getStringQueryParam('orderBy', 'mobilization_start_date');
        $ascending = $request->getBooleanQueryParam('ascending');
        $limit = $request->getIntegerQueryParam('limit');

        $search = $request->getStringQueryParam('search');
        $categoryId = $request->getQueryParam('category');
        $parkId = $request->getIntegerQueryParam('park');
        $period = $request->getPeriodQueryParam('period');
        $endingToday = $request->getBooleanQueryParam('endingToday', false);
        $returnInventoryTodo = $request->getBooleanQueryParam('returnInventoryTodo', false);
        $notConfirmed = $request->getBooleanQueryParam('notConfirmed', false);
        $archived = $request->getBooleanQueryParam('archived', false);

        $queries = [];
        $queries[Event::class] = Event::query()
            ->when($categoryId === 'uncategorized' || is_numeric($categoryId), static fn (Builder $builder) => (
                $builder->whereHas('materials', static fn (Builder $eventMaterialQuery) => (
                    $eventMaterialQuery->whereHas('material', static fn (Builder $materialQuery) => (
                        $materialQuery->where('category_id', (
                            $categoryId !== 'uncategorized' ? (int) $categoryId : null
                        ))
                    ))
                ))
            ))
            ->when($parkId !== null, static fn (Builder $builder) => (
                $builder->havingMaterialInPark($parkId)
            ))
            ->when($notConfirmed, static fn (Builder $builder) => (
                $builder->where('is_confirmed', false)
            ))
            ->with(['materials', 'beneficiaries', 'technicians']);

        $query = (new QueryAggregator())->orderBy($orderBy, $ascending ? 'asc' : 'desc');
        foreach ($queries as $modelClass => $modelQuery) {
            $modelQuery
                ->when(
                    Auth::is([Group::READONLY_PLANNING_SELF]),
                    static fn (Builder $builder) => (
                        $builder->withInvolvedUser(Auth::user())
                    ),
                )
                ->when(
                    $search !== null && mb_strlen($search) >= 2,
                    static fn ($builder) => $builder->search($search),
                )
                ->when($period !== null, static fn (Builder $builder) => (
                    $builder->inPeriod($period)
                ))
                ->when($endingToday, static fn (Builder $builder) => (
                    $builder->endingToday()
                ))
                ->when($returnInventoryTodo, static fn (Builder $builder) => (
                    $builder->returnInventoryTodo()
                ))
                ->where('is_archived', $archived);

            $query->add($modelClass, $modelQuery);
        }

        $limit = is_numeric($limit) ? (int) $limit : self::MAX_GET_ALL_PER_PAGE;
        $results = $this->paginate($request, $query, min($limit, self::MAX_GET_ALL_PER_PAGE));

        $useMultipleParks = Park::count() > 1;

        $results['data'] = $results['data']->map(static fn ($booking) => array_merge(
            $booking->serialize($booking::SERIALIZE_BOOKING_EXCERPT),
            [
                'parks' => (
                    $useMultipleParks
                        ? array_values($booking->parks)
                        : []
                ),
            ],
        ));

        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    protected function getAllInPeriod(Request $request, Response $response): ResponseInterface
    {
        $period = $request->getPeriodQueryParam('period');
        if ($period === null) {
            throw new HttpException(
                $request,
                sprintf('The period is required for non-paginated data.'),
                StatusCode::STATUS_NOT_ACCEPTABLE,
            );
        }

        // - Limitation de la période récupérable.
        $maxEndDate = $period->getStartDate()->addDays(self::MAX_GET_ALL_PERIOD);
        if ($period->getEndDate()->isAfter($maxEndDate)) {
            throw new HttpException(
                $request,
                sprintf('The retrieval period for bookings may not exceed %s days.', self::MAX_GET_ALL_PERIOD),
                StatusCode::STATUS_RANGE_NOT_SATISFIABLE,
            );
        }

        $query = new QueryAggregator([
            // - Événements.
            Event::class => (
                Event::inPeriod($period)
                    ->when(
                        Auth::is([Group::READONLY_PLANNING_SELF]),
                        static fn (Builder $builder) => (
                            $builder->withInvolvedUser(Auth::user())
                        ),
                    )
                    ->with(['materials', 'beneficiaries', 'technicians'])
            ),
        ]);

        /** @var Collection<array-key, Event> $bookings */
        $bookings = $query->get();
        if ($bookings->isEmpty()) {
            return $response->withJson([], StatusCode::STATUS_OK);
        }

        $useMultipleParks = Park::count() > 1;

        $data = $bookings
            ->map(static fn ($booking) => array_replace(
                $booking->serialize($booking::SERIALIZE_BOOKING_EXCERPT),
                [
                    'parks' => $useMultipleParks
                        ? array_values($booking->parks)
                        : [],
                ],
            ))
            ->all();

        return $response->withJson($data, StatusCode::STATUS_OK);
    }
}
