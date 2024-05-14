<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Carbon\CarbonImmutable;
use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\Builder;
use Loxya\Config\Config;
use Loxya\Controllers\Traits\Crud;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Loxya\Models\Document;
use Loxya\Models\Event;
use Loxya\Models\Material;
use Loxya\Models\Park;
use Loxya\Models\Tag;
use Loxya\Services\Auth;
use Loxya\Services\I18n;
use Loxya\Support\Collections\MaterialsCollection;
use Loxya\Support\Database\QueryAggregator;
use Loxya\Support\Pdf;
use Loxya\Support\Str;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\UploadedFileInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\HttpCache\CacheProvider as HttpCacheProvider;

final class MaterialController extends BaseController
{
    use Crud\SoftDelete;

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

    public function getOne(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $material = Material::findOrFail($id);

        $materialData = $this->_getSafeMaterialSerializedData($material);
        return $response->withJson($materialData, StatusCode::STATUS_OK);
    }

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $paginated = $request->getBooleanQueryParam('paginated', true);
        $limit = $request->getIntegerQueryParam('limit');
        $ascending = $request->getBooleanQueryParam('ascending', true);
        $search = $request->getStringQueryParam('search');
        $quantitiesPeriod = $request->getPeriodQueryParam('quantitiesPeriod');
        $onlyDeleted = $request->getBooleanQueryParam('deleted', false);
        $orderBy = $request->getOrderByQueryParam('orderBy', Material::class);

        // - Filtres
        $categoryId = $request->getQueryParam('category', null);
        $subCategoryId = $request->getIntegerQueryParam('subCategory');
        $parkId = $request->getIntegerQueryParam('park');
        $tags = $request->getQueryParam('tags', []);

        $isComplexeOrderBy = (
            in_array($orderBy, ['stock_quantity', 'out_of_order_quantity'], true) &&
            ($parkId !== null)
        );

        $query = Material::query()
            ->when(
                $search !== null && mb_strlen($search) >= 2,
                static fn (Builder $subQuery) => $subQuery->search($search),
            )
            ->when($onlyDeleted, static fn (Builder $subQuery) => (
                $subQuery->onlyTrashed()
            ))
            ->when(
                !$isComplexeOrderBy,
                static fn (Builder $subQuery) => (
                    $subQuery->customOrderBy($orderBy, $ascending ? 'asc' : 'desc')
                ),
            );

        //
        // - Filtres
        //

        $query = $query
            // - Catégorie.
            ->when($categoryId === 'uncategorized' || is_numeric($categoryId), static fn ($builder) => (
                $builder->where('category_id', (
                    $categoryId !== 'uncategorized' ? (int) $categoryId : null
                ))
            ))
            // - Sous-catégorie.
            ->when($subCategoryId !== null, static fn ($builder) => (
                $builder->where('sub_category_id', $subCategoryId)
            ))
            // - Parc.
            ->when($parkId !== null, static fn ($builder) => (
                $builder->inPark($parkId)
            ))
            // - Tags.
            ->when(!empty($tags) && is_array($tags), static fn ($builder) => (
                $builder->whereHas('tags', static function ($query) use ($tags) {
                    $query->whereIn('id', $tags);
                })
            ));

        //
        // - Tri complexe.
        //

        if ($isComplexeOrderBy) {
            if ($orderBy === 'stock_quantity') {
                $query
                    ->reorder(
                        $query->raw('stock_quantity'),
                        $ascending ? 'asc' : 'desc',
                    );
            }
            if ($orderBy === 'out_of_order_quantity') {
                $query
                    ->reorder(
                        $query->raw('out_of_order_quantity'),
                        $ascending ? 'asc' : 'desc',
                    );
            }
        }

        //
        // - Requête + Résultat
        //

        $results = $paginated
            ? $this->paginate($request, $query, $limit)
            : ['data' => $query->get()];

        $results['data'] = Material::allWithAvailabilities($results['data'], $quantitiesPeriod);
        $results['data'] = $results['data']->map(static fn (Material $material) => (
            $material->serialize(Material::SERIALIZE_WITH_AVAILABILITY)
        ));

        $results = $paginated ? $results : $results['data'];
        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getAllWhileEvent(Request $request, Response $response): ResponseInterface
    {
        $eventId = $request->getIntegerAttribute('eventId');

        $currentEvent = Event::findOrFail($eventId);
        $materials = Material::orderBy('reference')->get();

        $materials = Material::allWithAvailabilities($materials, $currentEvent);
        $materials = $materials->map(static fn (Material $material) => (
            $material->serialize(Material::SERIALIZE_WITH_AVAILABILITY)
        ));

        return $response->withJson($materials, StatusCode::STATUS_OK);
    }

    public function getAllPdf(Request $request, Response $response): ResponseInterface
    {
        $onlyParkId = $request->getQueryParam('park', null);

        $parksMaterials = [];
        $parks = Park::with('materials')->get();
        foreach ($parks as $park) {
            if (is_numeric($onlyParkId) && (int) $onlyParkId !== $park->id) {
                continue;
            }

            $parkMaterials = $park->materials
                ->values();

            if ($parkMaterials->isEmpty()) {
                continue;
            }

            $parksMaterials[] = [
                'id' => $park->id,
                'name' => $park->name,
                'materials' => (new MaterialsCollection($parkMaterials))->bySubCategories(),
            ];
        }

        usort($parksMaterials, static fn ($a, $b) => strcmp($a['name'], $b['name'] ?: ''));

        // - Nom du parc (si export pour un seul parc)
        $parkOnlyName = null;
        if (is_numeric($onlyParkId)) {
            $parksName = $parks->pluck('name', 'id')->all();
            if (array_key_exists($onlyParkId, $parksName)) {
                $parkOnlyName = $parksName[$onlyParkId];
            }
        }

        $date = CarbonImmutable::now();
        $company = Config::get('companyData');
        $fileName = Str::slugify(implode('-', [
            $this->i18n->translate('materials-list'),
            $parkOnlyName ?: $company['name'],
            $date->format('Y-m-d'),
        ]));

        $pdf = Pdf::createFromTemplate('materials-list-default', $this->i18n, $fileName, [
            'date' => $date,
            'company' => $company,
            'parkOnlyName' => $parkOnlyName,
            'currency' => Config::get('currency.iso'),
            'parksMaterialsList' => $parksMaterials,
        ]);

        return $pdf->asResponse($response);
    }

    public function getDocuments(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $material = Material::findOrFail($id);

        return $response->withJson($material->documents, StatusCode::STATUS_OK);
    }

    public function getBookings(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $limit = $request->getQueryParam('limit', null);

        $material = Material::findOrFail($id);

        $query = (new QueryAggregator())
            // - Événements.
            ->add(Event::class, (
                $material->events()
                    ->with(['beneficiaries', 'technicians'])
                    ->with(['materials' => static function ($q) {
                        $q->reorder('name', 'asc');
                    }])
            ))
            ->orderBy('mobilization_start_date', 'desc');

        $results = $this->paginate($request, $query, is_numeric($limit) ? (int) $limit : 50);

        // - Le prefetching a été supprimé car ça ajoutait une trop grosse utilisation de la mémoire,
        //   et ralentissait beaucoup la requête.

        $useMultipleParks = Park::count() > 1;

        $results['data'] = $results['data']->map(static fn ($booking) => array_merge(
            $booking->serialize($booking::SERIALIZE_BOOKING_SUMMARY),
            [
                'pivot' => [
                    'quantity' => $booking->pivot->quantity,
                ],
                'parks' => $useMultipleParks
                    ? array_values($booking->parks)
                    : [],
            ],
        ));

        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getPicture(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
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

    public function create(Request $request, Response $response): ResponseInterface
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $material = $this->_saveMaterial(null, $postData);

        $materialData = $this->_getSafeMaterialSerializedData($material);
        return $response->withJson($materialData, StatusCode::STATUS_CREATED);
    }

    public function update(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $material = Material::findOrFail($id);

        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $material = $this->_saveMaterial($id, $postData);

        $materialData = $this->_getSafeMaterialSerializedData($material);
        return $response->withJson($materialData, StatusCode::STATUS_OK);
    }

    public function attachDocument(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
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

    public function restore(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $material = Material::staticRestore($id);

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
        return $material->serialize(Material::SERIALIZE_DETAILS);
    }
}
