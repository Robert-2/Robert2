<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Robert2\API\Contracts\PeriodInterface;
use Robert2\API\Http\Request;
use Robert2\API\Models\Enums\Group;
use Robert2\API\Models\Event;
use Robert2\API\Models\Park;
use Robert2\API\Services\Auth;
use Robert2\Support\Period;
use Slim\Exception\HttpException;
use Slim\Http\Response;

class BookingController extends BaseController
{
    public const MAX_GET_ALL_PERIOD = 3.5 * 30; // - En jours

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
        $restrictedParks = !Auth::is(Group::ADMIN)
            ? Auth::user()->restricted_parks
            : [];

        $data = $bookings
            ->map(fn($booking) => array_merge(
                $booking->serialize($booking::SERIALIZE_BOOKING),
                [
                    'entity' => $booking::TYPE,
                    'parks' => (
                        $useMultipleParks
                            ? array_diff($booking->parks, $restrictedParks)
                            : null
                    ),
                ]
            ))
            ->all();

        return $response->withJson($data, StatusCode::STATUS_OK);
    }
}
