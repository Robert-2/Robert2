<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Carbon\CarbonImmutable;
use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Psr\Http\Message\UploadedFileInterface;
use Loxya\Config\Config;
use Loxya\Contracts\PeriodInterface;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Loxya\Models\Document;
use Loxya\Models\Enums\Group;
use Loxya\Models\Event;
use Loxya\Models\Material;
use Loxya\Models\Park;
use Loxya\Models\Tag;
use Loxya\Models\User;
use Loxya\Services\Auth;
use Loxya\Services\I18n;
use Loxya\Support\Collections\MaterialsCollection;
use Loxya\Support\Pdf;
use Loxya\Support\Period;
use Loxya\Support\Str;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\HttpCache\CacheProvider as HttpCacheProvider;

class MaterialController extends BaseController
{
    use WithCrud;

    private I18n $i18n;

    private HttpCacheProvider $httpCache;

    public function __construct(Container $container, I18n $i18n, HttpCacheProvider $httpCache)
    {
        parent::__construct($container);

        $this->i18n = $i18n;
        $this->httpCache = $httpCache;
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = Material::findOrFail($id);

        $materialData = $this->_getSafeMaterialSerializedData($material);
        return $response->withJson($materialData, StatusCode::STATUS_OK);
    }

    public function getTags(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = Material::findOrFail($id);
        return $response->withJson($material->tags, StatusCode::STATUS_OK);
    }

    public function getAll(Request $request, Response $response): Response
    {
        $paginated = (bool) $request->getQueryParam('paginated', true);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool) $request->getQueryParam('ascending', true);
        $search = $request->getQueryParam('search', null);
        $dateForQuantities = $request->getQueryParam('dateForQuantities', null);
        $onlyDeleted = (bool) $request->getQueryParam('deleted', false);

        $orderBy = $request->getQueryParam('orderBy', null);
        $allowedOrderFields = ['name', 'reference', 'rental_price', 'stock_quantity', 'out_of_order_quantity'];
        if (!in_array($orderBy, $allowedOrderFields, true)) {
            $orderBy = null;
        }

        $query = (new Material)
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($search)
            ->getAll($onlyDeleted);

        //
        // - Filtres
        //

        $categoryId = $request->getQueryParam('category', null);
        $subCategoryId = $request->getQueryParam('subCategory', null);
        $parkId = $request->getQueryParam('park', null);
        $tags = $request->getQueryParam('tags', []);

        $query = $query
            // - Catégorie.
            ->when($categoryId === 'uncategorized' || is_numeric($categoryId), fn ($builder) => (
                $builder->where('category_id', (
                    $categoryId !== 'uncategorized' ? (int) $categoryId : null
                ))
            ))
            // - Sous-catégorie.
            ->when(is_numeric($subCategoryId), fn ($builder) => (
                $builder->where('sub_category_id', (int) $subCategoryId)
            ))
            // - Parc.
            ->when(is_numeric($parkId), fn ($builder) => (
                $builder->inPark((int) $parkId)
            ))
            // - Tags.
            ->when(!empty($tags) && is_array($tags), fn ($builder) => (
                $builder->whereHas('tags', function ($query) use ($tags) {
                    $query->whereIn('id', $tags);
                })
            ));

        //
        // - Requête + Résultat
        //

        $results = $paginated
            ? $this->paginate($request, $query, is_numeric($limit) ? (int) $limit : null)
            : ['data' => $query->get()];

        // - Filtre des quantités pour une date ou une période donnée
        $periodForQuantities = null;
        if ($dateForQuantities !== null) {
            $dateForQuantities = !is_array($dateForQuantities)
                ? [$dateForQuantities, $dateForQuantities]
                : $dateForQuantities;

            $periodForQuantities = getPeriodFromArray($dateForQuantities);
        }

        $results['data'] = Material::allWithAvailabilities($results['data'], $periodForQuantities);
        $results['data'] = $results['data']->map(function ($material) {
            $material->append('available_quantity');
            return $material->serialize();
        });

        $results = $paginated ? $results : $results['data'];
        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getAllWhileEvent(Request $request, Response $response): Response
    {
        $eventId = (int) $request->getAttribute('eventId');
        $currentEvent = Event::findOrFail($eventId);
        $materials = (new Material)
            ->setOrderBy('reference', true)
            ->getAll()
            ->get();

        // FIXME: Prendre en compte les parcs restreints (cf. #163).
        $materials = Material::allWithAvailabilities($materials, $currentEvent);
        $materials = $materials->map(function ($material) {
            $material->append('available_quantity');
            return $material->serialize();
        });

        return $response->withJson($materials, StatusCode::STATUS_OK);
    }

    public function getAllPdf(Request $request, Response $response): Response
    {
        $onlyParkId = $request->getQueryParam('park', null);

        $parksMaterials = [];
        $parks = Park::with('materials')->get();
        foreach ($parks as $park) {
            if (is_numeric($onlyParkId) && (int) $onlyParkId !== $park->id) {
                continue;
            }

            $parkMaterials = $park->materials->values();

            if ($parkMaterials->isEmpty()) {
                continue;
            }

            $parksMaterials[] = [
                'id' => $park->id,
                'name' => $park->name,
                'materials' => (new MaterialsCollection($parkMaterials))->bySubCategories(),
            ];
        }

        usort($parksMaterials, function ($a, $b) {
            return strcmp($a['name'], $b['name'] ?: '');
        });

        // - Nom du parc (si export pour un seul parc)
        $parkOnlyName = null;
        if (is_numeric($onlyParkId)) {
            $parksName = $parks->pluck('name', 'id')->all();
            if (array_key_exists($onlyParkId, $parksName)) {
                $parkOnlyName = $parksName[$onlyParkId];
            }
        }

        $date = CarbonImmutable::now();
        $company = Config::getSettings('companyData');
        $fileName = Str::slugify(implode('-', [
            $this->i18n->translate('materials-list'),
            $parkOnlyName ?: $company['name'],
            $date->format('Y-m-d'),
        ]));

        $pdf = Pdf::createFromTemplate('materials-list-default', $this->i18n, $fileName, [
            'date' => $date,
            'company' => $company,
            'parkOnlyName' => $parkOnlyName,
            'currency' => Config::getSettings('currency')['iso'],
            'parksMaterialsList' => $parksMaterials,
        ]);

        return $pdf->asResponse($response);
    }

    public function getDocuments(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = Material::findOrFail($id);

        return $response->withJson($material->documents, StatusCode::STATUS_OK);
    }

    // TODO: Limiter aux 3 derniers mois + Tous les futurs.
    public function getBookings(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = Material::findOrFail($id);

        /** @var Collection|(Event)[] $bookings */
        $bookings = (new Collection())
            // - Événements.
            ->concat(
                $material->events()
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
                    'pivot' => [
                        'quantity' => $booking->pivot->quantity,
                    ],
                    'parks' => (
                        $useMultipleParks
                            ? $booking->parks
                            : null
                    ),
                    'categories' => $booking->categories,
                ]
            ))
            ->sortByDesc('start_date')
            ->values()
            ->all();

        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    public function getPicture(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = Material::findOrFail($id);

        $picturePath = $material->picture_real_path;
        if (!$picturePath) {
            throw new HttpNotFoundException($request, "Il n'y a pas d'image pour ce matériel.");
        }

        // - Le fichier source est introuvable ...
        if (!file_exists($picturePath)) {
            throw new HttpNotFoundException($request);
        }

        /** @var Response $response */
        $response = $this->httpCache->denyCache($response);
        return $response
            ->withStatus(StatusCode::STATUS_OK)
            ->withFile($picturePath);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function create(Request $request, Response $response): Response
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $material = $this->_saveMaterial(null, $postData);

        $materialData = $this->_getSafeMaterialSerializedData($material);
        return $response->withJson($materialData, StatusCode::STATUS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = Material::findOrFail($id);

        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $material = $this->_saveMaterial($id, $postData);

        $materialData = $this->_getSafeMaterialSerializedData($material);
        return $response->withJson($materialData, StatusCode::STATUS_OK);
    }

    public function attachDocument(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = Material::findOrFail($id);

        /** @var UploadedFileInterface[] $uploadedFiles */
        $uploadedFiles = $request->getUploadedFiles();
        if (count($uploadedFiles) !== 1) {
            throw new HttpBadRequestException($request, "Invalid number of files sent: a single file is expected.");
        }

        $file = array_values($uploadedFiles)[0];
        $document = new Document(compact('file'));
        $document->author()->associate(Auth::user());
        $material->documents()->save($document);

        return $response->withJson($document, StatusCode::STATUS_CREATED);
    }

    public function restore(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = $this->getModelClass()::staticRestore($id);

        $materialData = $this->_getSafeMaterialSerializedData($material);
        return $response->withJson($materialData, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _saveMaterial(?int $id, array $postData): Material
    {
        if (empty($postData)) {
            throw new \InvalidArgumentException("No data was provided.");
        }

        if (array_key_exists('stock_quantity', $postData)) {
            $stockQuantity = $postData['stock_quantity'];
            if ($stockQuantity !== null && (int) $stockQuantity < 0) {
                $postData['stock_quantity'] = 0;
            }
        }

        if (array_key_exists('out_of_order_quantity', $postData)) {
            $stockQuantity = (int) ($postData['stock_quantity'] ?? 0);
            $outOfOrderQuantity = (int) $postData['out_of_order_quantity'];
            if ($outOfOrderQuantity > $stockQuantity) {
                $outOfOrderQuantity = $stockQuantity;
                $postData['out_of_order_quantity'] = $outOfOrderQuantity;
            }
            if ($outOfOrderQuantity <= 0) {
                $postData['out_of_order_quantity'] = null;
            }
        }

        return dbTransaction(function () use ($id, $postData) {
            $material = null;
            $hasFailed = false;
            $validationErrors = [];

            try {
                /** @var Material $material */
                $material = Material::staticEdit($id, $postData);
            } catch (ValidationException $e) {
                $validationErrors = $e->getValidationErrors();
                $hasFailed = true;
            }

            if (array_key_exists('tags', $postData) && is_array($postData['tags'])) {
                $tags = [];
                foreach ($postData['tags'] as $tagId) {
                    if (empty($tagId)) {
                        continue;
                    }

                    $relatedTag = is_numeric($tagId) ? Tag::find($tagId) : null;
                    if ($relatedTag === null) {
                        $hasFailed = true;
                        $validationErrors['tags'] = [$this->i18n->translate('field-contains-invalid-values')];
                        break;
                    }

                    $tags[] = $relatedTag->id;
                }

                if (!$hasFailed) {
                    $material->tags()->sync($tags);
                }
            }

            if (
                Auth::is(Group::ADMIN) &&
                array_key_exists('approvers', $postData) &&
                is_array($postData['approvers'])
            ) {
                $approvers = [];
                foreach ($postData['approvers'] as $approverId) {
                    if (empty($approverId)) {
                        continue;
                    }

                    $relatedUser = is_numeric($approverId) ? User::find($approverId) : null;
                    if ($relatedUser === null || $relatedUser?->group !== Group::MEMBER) {
                        $hasFailed = true;
                        $validationErrors['approvers'] = [$this->i18n->translate('field-contains-invalid-values')];
                        break;
                    }

                    $approvers[] = $relatedUser->id;
                }

                if (!$hasFailed) {
                    $material->approvers()->sync($approvers);
                }
            }

            if (array_key_exists('attributes', $postData) && is_array($postData['attributes'])) {
                $attributes = [];
                foreach ($postData['attributes'] as $attribute) {
                    if (empty($attribute['value'])) {
                        continue;
                    }

                    $attributes[$attribute['id']] = [
                        'value' => (string) $attribute['value'],
                    ];
                }

                if (!$hasFailed) {
                    $material->attributes()->sync($attributes);
                }
            }

            if ($hasFailed) {
                throw new ValidationException($validationErrors);
            }

            return $material->refresh();
        });
    }

    protected function _getSafeMaterialSerializedData(Material $material): array
    {
        $materialData = $material->serialize(Material::SERIALIZE_DETAILS);

        return $materialData;
    }
}
