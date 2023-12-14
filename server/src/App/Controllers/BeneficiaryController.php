<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Carbon;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Loxya\Models\Enums\Group;
use Loxya\Models\Beneficiary;
use Loxya\Models\Event;
use Loxya\Models\Park;
use Loxya\Services\Auth;
use Loxya\Support\Database\QueryAggregator;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

class BeneficiaryController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $paginated = (bool) $request->getQueryParam('paginated', true);
        $search = $request->getQueryParam('search', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool) $request->getQueryParam('ascending', true);
        $onlyDeleted = (bool) $request->getQueryParam('deleted', false);

        $orderBy = $request->getQueryParam('orderBy', null);
        if (!in_array($orderBy, ['full_name', 'reference', 'company', 'email'], true)) {
            $orderBy = null;
        }

        $query = (new Beneficiary)
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($search)
            ->getAll($onlyDeleted);

        if ($paginated) {
            $results = $this->paginate($request, $query, is_numeric($limit) ? (int) $limit : null);
        } else {
            $results = $query->get();
        }

        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getBookings(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $beneficiary = Beneficiary::findOrFail($id);
        $after = $request->getQueryParam('after', null);
        $limit = $request->getQueryParam('limit', null);

        $direction = strtolower($request->getQueryParam('direction', 'desc'));
        if (!in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $events = $beneficiary->events()
            ->with(['beneficiaries', 'technicians'])
            ->with(['materials' => function ($q) {
                $q->reorder('name', 'asc');
            }]);

        if ($after) {
            $date = Carbon::parse($after);
            $events->where('end_date', '>=', $date);
        }

        $query = (new QueryAggregator())
            ->add(Event::class, $events)
            ->orderBy('start_date', $direction);

        $results = $this->paginate($request, $query, is_numeric($limit) ? (int) $limit : 50);

        // - Le prefetching a été supprimé car ça ajoutait une trop grosse utilisation de la mémoire,
        //   et ralentissait beaucoup la requête.

        $useMultipleParks = Park::count() > 1;

        $results['data'] = $results['data']->map(fn($booking) => array_merge(
            $booking->serialize($booking::SERIALIZE_BOOKING_SUMMARY),
            [
                'entity' => $booking::TYPE,
                'categories' => $booking->categories,
                'parks' => (
                    $useMultipleParks
                        ? $booking->parks
                        : null
                ),
            ]
        ));

        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getEstimates(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $beneficiary = Beneficiary::findOrFail($id);
        $estimates = $beneficiary->estimates;

        return $response->withJson($estimates, StatusCode::STATUS_OK);
    }

    public function getInvoices(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $beneficiary = Beneficiary::findOrFail($id);
        $invoices = $beneficiary->invoices;

        return $response->withJson($invoices, StatusCode::STATUS_OK);
    }

    public function create(Request $request, Response $response): ResponseInterface
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $postData = Beneficiary::unserialize($postData);
        if (!Auth::is(Group::ADMIN)) {
            unset($postData['user']);
        }

        try {
            $beneficiary = Beneficiary::new($postData);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
            if (empty($errors)) {
                throw $e;
            }

            $errors = Beneficiary::serializeValidation($errors);
            throw new ValidationException($errors);
        }

        $beneficiary = static::_formatOne($beneficiary);

        return $response->withJson($beneficiary, StatusCode::STATUS_CREATED);
    }

    public function update(Request $request, Response $response): ResponseInterface
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $postData = Beneficiary::unserialize($postData);
        if (!Auth::is(Group::ADMIN)) {
            unset($postData['user']);
        }

        try {
            $id = (int) $request->getAttribute('id');
            $beneficiary = Beneficiary::staticEdit($id, $postData);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
            if (empty($errors)) {
                throw $e;
            }

            $errors = Beneficiary::serializeValidation($errors);
            throw new ValidationException($errors);
        }

        $beneficiary = static::_formatOne($beneficiary);

        return $response->withJson($beneficiary, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected static function _formatOne(Beneficiary $beneficiary): array
    {
        return $beneficiary->serialize(Beneficiary::SERIALIZE_DETAILS);
    }
}
