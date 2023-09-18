<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Loxya\Contracts\PeriodInterface;
use Loxya\Errors\Enums\ApiErrorCode;
use Loxya\Errors\Exception\ApiBadRequestException;
use Loxya\Errors\Exception\HttpUnprocessableEntityException;
use Loxya\Http\Request;
use Loxya\Models\Event;
use Loxya\Models\Park;
use Loxya\Support\Period;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;

class BookingController extends BaseController
{
    public const MAX_GET_ALL_PERIOD = 3.5 * 30; // - En jours

    public const BOOKING_TYPES = [
        Event::TYPE => Event::class,
    ];

    public function getAll(Request $request, Response $response): ResponseInterface
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

        // - NOTE : Ne pas prefetch le materiel des bookables via `->with()`,
        //   car cela peut surcharger la mémoire rapidement.
        $allConcurrentBookables = (new Collection())
            // - Événements.
            ->concat(
                Event::inPeriod($period)->get()
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
                    'categories' => $booking->categories,
                ]
            ))
            ->all();

        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    public function updateMaterials(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $entity = $request->getAttribute('entity');
        if (!array_key_exists($entity, self::BOOKING_TYPES)) {
            throw new HttpNotFoundException($request, "Booking type (entity) not recognized.");
        }

        /** @var Event|Reservation $booking */
        $booking = self::BOOKING_TYPES[$entity]::findOrFail($id);

        if (!$booking->is_editable) {
            throw new HttpUnprocessableEntityException($request, "This booking is no longer editable.");
        }

        $rawMaterials = $request->getParsedBody();
        if (!is_array($rawMaterials)) {
            throw new HttpBadRequestException($request, "Missing materials to update reservation.");
        }

        try {
            $booking->syncMaterials($rawMaterials);
        } catch (\LengthException $e) {
            throw new ApiBadRequestException(ApiErrorCode::EMPTY_PAYLOAD, $e->getMessage());
        } catch (\InvalidArgumentException $e) {
            throw new HttpBadRequestException($request, $e->getMessage());
        }

        $data = array_replace(
            $booking->serialize($booking::SERIALIZE_BOOKING_DEFAULT),
            compact('entity'),
        );
        return $response->withJson($data, StatusCode::STATUS_OK);
    }
}
