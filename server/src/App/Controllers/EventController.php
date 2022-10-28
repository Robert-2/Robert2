<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Carbon;
use Robert2\API\Config\Config;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Enums\Group;
use Robert2\API\Models\Event;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Robert2\API\Services\Auth;
use Robert2\API\Services\I18n;
use Slim\Exception\HttpException;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class EventController extends BaseController
{
    use WithCrud;
    use WithPdf;

    public const MAX_GET_ALL_PERIOD = 3.5 * 30; // - En jours

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
        $search = $request->getQueryParam('search', null);
        $exclude = $request->getQueryParam('exclude', null);

        if ($search) {
            $query = (new Event)
                ->addSearch($search)
                ->select(['id', 'title', 'start_date', 'end_date', 'location'])
                ->whereHas('materials');

            if ($exclude) {
                $query->where('id', '<>', $exclude);
            }

            $count = $query->count();
            $results = $query->orderBy('start_date', 'desc')->limit(10)->get();
            return $response->withJson(['count' => $count, 'data' => $results]);
        }

        $startDate = $request->getQueryParam('start', null);
        $endDate = $request->getQueryParam('end', null);

        // - Limitation de la période récupérable
        $maxEndDate = Carbon::parse($startDate)->addDays(self::MAX_GET_ALL_PERIOD);
        if (Carbon::parse($endDate)->greaterThan($maxEndDate)) {
            throw new HttpException(
                $request,
                sprintf('The retrieval period for events may not exceed %s days.', self::MAX_GET_ALL_PERIOD),
                StatusCode::STATUS_RANGE_NOT_SATISFIABLE
            );
        }

        $query = Event::inPeriod($startDate, $endDate)
            ->with('beneficiaries')
            ->with('technicians')
            ->with(['materials' => function ($q) {
                $q->orderBy('name', 'asc');
            }]);

        $deleted = (bool)$request->getQueryParam('deleted', false);
        if ($deleted) {
            $query->onlyTrashed();
        }

        $events = $query->get();

        $concurrentEvents = Event::inPeriod($startDate, $endDate)
            ->with('materials')
            ->get()->toArray();

        foreach ($events as $event) {
            $event->__cachedConcurrentEvents = array_values(
                array_filter($concurrentEvents, function ($otherEvent) use ($event) {
                    $startDate = new \DateTime($event->start_date);
                    $otherStartDate = new \DateTime($otherEvent['start_date']);
                    $endDate = new \DateTime($event->end_date);
                    $otherEndDate = new \DateTime($otherEvent['end_date']);
                    return (
                        $event->id !== $otherEvent['id'] &&
                        $startDate <= $otherEndDate &&
                        $endDate >= $otherStartDate
                    );
                })
            );
        }

        $append = [
            'technicians',
            'beneficiaries',
            'has_missing_materials',
            'has_not_returned_materials',
        ];

        $data = $query->get()->append($append)
            ->map(fn($event) => $event->serialize())
            ->all();

        $useMultipleParks = Park::count() > 1;
        foreach ($events as $index => $event) {
            $data[$index]['parks'] = $useMultipleParks
                ? Event::getParks($event->materials)
                : null;
        }

        // FIXME: Pourquoi le `['data' => ...]` ?
        return $response->withJson(['data' => $data], StatusCode::STATUS_OK);
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $eventData = $this->_getPopulatedEvent($id, true);
        return $response->withJson($eventData, StatusCode::STATUS_OK);
    }

    public function getMissingMaterials(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');

        $missingMaterials = Event::findOrFail($id)->missingMaterials()
            ->map(fn($material) => (
                array_replace(
                    $material->append('missing_quantity')->serialize(),
                    ['pivot' => $material->pivot->toArray()]
                )
            ));

        return $response->withJson($missingMaterials, StatusCode::STATUS_OK);
    }

    public function create(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        if (!isset($postData['user_id'])) {
            $postData['user_id'] = Auth::user()->id;
        }

        $event = Event::new($postData);
        $formattedEvent = $this->_getPopulatedEvent($event->id);
        return $response->withJson($formattedEvent, StatusCode::STATUS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $event = Event::staticEdit($id, $postData);
        $formattedEvent = $this->_getPopulatedEvent($event->id);
        return $response->withJson($formattedEvent, StatusCode::STATUS_OK);
    }

    public function duplicate(Request $request, Response $response): Response
    {
        $originalId = (int)$request->getAttribute('id');
        if (!Event::staticExists($originalId)) {
            throw new HttpNotFoundException($request);
        }

        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        try {
            $newEvent = Event::duplicate($originalId, $postData);
        } catch (ModelNotFoundException $e) {
            throw new HttpNotFoundException($request);
        }

        $formattedEvent = $this->_getPopulatedEvent($newEvent->id);
        return $response->withJson($formattedEvent, StatusCode::STATUS_CREATED);
    }

    public function updateMaterialReturn(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $postData = (array)$request->getParsedBody();
        $this->_saveReturnQuantities($id, $postData);

        $formattedEvent = $this->_getPopulatedEvent($id);
        return $response->withJson($formattedEvent, StatusCode::STATUS_OK);
    }

    public function updateMaterialTerminate(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Event::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $postData = (array)$request->getParsedBody();
        $this->_saveReturnQuantities($id, $postData);

        Event::staticEdit($id, [
            'is_confirmed' => true,
            'is_return_inventory_done' => true,
        ]);

        $this->_setBrokenMaterialsQuantities($postData);

        $formattedEvent = $this->_getPopulatedEvent($id);
        return $response->withJson($formattedEvent, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _saveReturnQuantities(int $id, array $data): void
    {
        $event = Event::find($id);

        $eventMaterialsQuantities = [];
        foreach ($event->materials as $material) {
            $eventMaterialsQuantities[$material->id] = $material->pivot->quantity;
        };

        $quantities = [];
        $errors = [];
        foreach ($data as $quantity) {
            if (!array_key_exists('id', $quantity)) {
                continue;
            }
            $materialId = $quantity['id'];

            if (!array_key_exists('actual', $quantity) || !is_integer($quantity['actual'])) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => $this->i18n->translate('returned-quantity-not-valid'),
                ];
                continue;
            }
            $actual = (int)$quantity['actual'];

            if (!array_key_exists('broken', $quantity) || !is_integer($quantity['broken'])) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => $this->i18n->translate('broken-quantity-not-valid'),
                ];
                continue;
            }
            $broken = (int)$quantity['broken'];

            if ($actual < 0 || $broken < 0) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => $this->i18n->translate('quantities-cannot-be-negative'),
                ];
                continue;
            }

            if ($actual > $eventMaterialsQuantities[$materialId]) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => $this->i18n->translate(
                        'returned-quantity-cannot-be-greater-than-output-quantity'
                    ),
                ];
                continue;
            }

            if ($broken > $actual) {
                $errors[] = [
                    'id' => $materialId,
                    'message' => $this->i18n->translate(
                        'broken-quantity-cannot-be-greater-than-returned-quantity'
                    ),
                ];
                continue;
            }

            $quantities[$materialId] = [
                'quantity_returned' => $actual,
                'quantity_broken' => $broken,
            ];
        }

        if (!empty($errors)) {
            throw new ValidationException($errors);
        }

        $event->Materials()->sync($quantities);
    }

    protected function _setBrokenMaterialsQuantities(array $data): void
    {
        foreach ($data as $quantities) {
            $broken = (int)$quantities['broken'];
            if ($broken === 0) {
                continue;
            }

            $material = Material::find($quantities['id']);
            if (!$material) {
                continue;
            }

            $material->out_of_order_quantity += (int)$quantities['broken'];
            $material->save();
        }
    }

    protected function _getPopulatedEvent(int $id, bool $withDetails = false): Event
    {
        $appendRelations = [
            'beneficiaries',
            'technicians',
            'materials',
            'estimates',
            'bills',
            'user',
        ];

        $event = Event::query()
            ->with($appendRelations)
            ->find($id)
            ->append($appendRelations);

        if ($withDetails) {
            $event = $event->append([
                'has_missing_materials',
                'has_not_returned_materials',
            ]);
        }

        return $event;
    }
}
