<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Robert2\API\Contracts\PeriodInterface;
use Robert2\API\Http\Request;
use Robert2\API\Models\Event;
use Robert2\API\Models\Park;
use Robert2\Support\Period;
use Slim\Exception\HttpException;
use Slim\Http\Response;

class BookingController extends BaseController
{
    public const MAX_GET_ALL_PERIOD = 3.5 * 30; // - En jours

    public const BOOKING_TYPES = [
        Event::TYPE,
    ];

    public function getAll(Request $request, Response $response): Response
    {
        $startDate = $request->getQueryParam('start', null);
        $endDate = $request->getQueryParam('end', null);

        // - Limitation de la période récupérable.
        $maxEndDate = Carbon::parse($startDate)->addDays(self::MAX_GET_ALL_PERIOD);
        if (Carbon::parse($endDate)->greaterThan($maxEndDate)) {
            throw new HttpException(
                $request,
                sprintf('The retrieval period for bookings may not exceed %s days.', self::MAX_GET_ALL_PERIOD),
                StatusCode::STATUS_RANGE_NOT_SATISFIABLE
            );
        }

        /** @var Collection|(Event)[] $bookings */
        $bookings = (new Collection())
            // - Événements.
            ->concat(
                Event::inPeriod($startDate, $endDate)
                    ->with('beneficiaries')
                    ->with('technicians')
                    ->with(['materials' => function ($q) {
                        $q->reorder('name', 'asc');
                    }])
                    ->get()
            );

        if ($bookings->isEmpty()) {
            return $response->withJson([], StatusCode::STATUS_OK);
        }

        $period = $bookings->reduce(
            fn(?Period $currentPeriod, PeriodInterface $booking) => (
                $currentPeriod === null
                    ? new Period($booking)
                    : $currentPeriod->merge($booking)
            )
        );

        $allConcurrentBookables = (new Collection())
            // - Événements.
            ->concat(
                Event::inPeriod($period)
                    ->with('materials')->get()
            );

        foreach ($bookings as $booking) {
            $booking->__cachedConcurrentBookables = $allConcurrentBookables
                ->filter(fn($otherBookable) => (
                    !$booking->is($otherBookable) &&
                    $booking->getStartDate() <= $otherBookable->getEndDate() &&
                    $booking->getEndDate() >= $otherBookable->getStartDate()
                ))
                ->values();
        }

        $useMultipleParks = Park::count() > 1;

        $data = $bookings
            ->map(fn($booking) => array_merge(
                $booking->serialize($booking::SERIALIZE_BOOKING_SUMMARY),
                [
                    'entity' => $booking::TYPE,
                    'parks' => (
                        $useMultipleParks
                            ? $booking->parks
                            : null
                    ),
                ]
            ))
            ->all();

        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    public function updateMaterials(Request $request, Response $response): Response
    {
        $data = (array) $request->getParsedBody();
        if (!isset($data['entity'])) {
            throw new \InvalidArgumentException("Missing entity name to identify booking.");
        }

        $entity = $data['entity'];
        if (!in_array($entity, self::BOOKING_TYPES, true)) {
            throw new \InvalidArgumentException("Booking type (entity) not recognized.");
        }

        if (!isset($data['materials']) || !is_array($data['materials'])) {
            throw new \InvalidArgumentException("Missing materials to update reservation.");
        }

        $modelQuery = match ($entity) {
            /** Événement */
            Event::TYPE => Event::query()
                ->where(function ($query) {
                    $query
                        ->where('end_date', '>=', Carbon::today())
                        ->orWhere(function ($query) {
                            $query
                                ->where('end_date', '<=', Carbon::today())
                                ->where('is_confirmed', false);
                        });
                }),
        };

        $id = (int) $request->getAttribute('id');
        $booking = $modelQuery->findOrFail($id);

        $booking->syncMaterials($data['materials']);

        return $response->withJson(
            array_merge($booking->serialize($booking::SERIALIZE_BOOKING_DEFAULT), compact('entity')),
            StatusCode::STATUS_OK,
        );
    }
}
