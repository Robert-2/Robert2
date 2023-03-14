<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Carbon\CarbonImmutable;
use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Robert2\API\Config\Config;
use Robert2\API\Contracts\PeriodInterface;
use Robert2\API\Controllers\Traits\FileResponse;
use Robert2\API\Controllers\Traits\Taggable;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Errors\Exception\ValidationException;
use Robert2\API\Http\Request;
use Robert2\API\Models\Document;
use Robert2\API\Models\Enums\Group;
use Robert2\API\Models\Event;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Robert2\API\Models\Tag;
use Robert2\API\Models\User;
use Robert2\API\Services\Auth;
use Robert2\API\Services\I18n;
use Robert2\Support\Collections\MaterialsCollection;
use Robert2\Support\Pdf;
use Robert2\Support\Period;
use Robert2\Support\Str;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\HttpCache\CacheProvider as HttpCacheProvider;

class MaterialController extends BaseController
{
    use WithCrud, FileResponse, Taggable {
        Taggable::getAll insteadof WithCrud;
    }

    /** @var I18n */
    private $i18n;

    /** @var HttpCacheProvider */
    private $httpCache;

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

    public function getAll(Request $request, Response $response): Response
    {
        $paginated = (bool) $request->getQueryParam('paginated', true);
        $limit = $request->getQueryParam('limit', null);
        $searchTerm = $request->getQueryParam('search', null);
        $searchField = $request->getQueryParam('searchBy', null);
        $parkId = $request->getQueryParam('park', null);
        $categoryId = $request->getQueryParam('category', null);
        $subCategoryId = $request->getQueryParam('subCategory', null);
        $dateForQuantities = $request->getQueryParam('dateForQuantities', null);
        $withDeleted = (bool) $request->getQueryParam('deleted', false);
        $tags = $request->getQueryParam('tags', []);

        $options = [];
        if (is_numeric($parkId)) {
            $options['park_id'] = (int) $parkId;
        }
        if ($categoryId === 'uncategorized' || is_numeric($categoryId)) {
            $options['category_id'] = $categoryId !== 'uncategorized'
                ? (int) $categoryId
                : null;
        }
        if (is_numeric($subCategoryId)) {
            $options['sub_category_id'] = (int) $subCategoryId;
        }

        $orderBy = $request->getQueryParam('orderBy', null);
        $ascending = (bool) $request->getQueryParam('ascending', true);

        $model = (new Material)
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField);

        if (empty($options) && empty($tags)) {
            $model = $model->getAll($withDeleted);
        } else {
            $model = $model->getAllFilteredOrTagged($options, $tags, $withDeleted);
        }

        $results = $paginated
            ? $this->paginate($request, $model, is_numeric($limit) ? (int) $limit : null)
            : ['data' => $model->get()];

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

        $currentEvent = Event::find($eventId);
        if (!$currentEvent) {
            throw new HttpNotFoundException($request);
        }

        $materials = (new Material)
            ->setOrderBy('reference', true)
            ->getAll()
            ->get();

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
        $fileName = Str::slug(implode('-', [
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

    public function getAllDocuments(Request $request, Response $response): Response
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
                $booking->serialize($booking::SERIALIZE_BOOKING),
                [
                    'entity' => Str::slug(class_basename($booking)),
                    'pivot' => [
                        'quantity' => $booking->pivot->quantity,
                    ],
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

    public function getPicture(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = Material::findOrFail($id);

        $picturePath = $material->picture_real_path;
        if (!$picturePath) {
            throw new HttpNotFoundException($request, "Il n'y a pas d'image pour ce matériel.");
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

    public function handleUploadDocuments(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $material = Material::findOrFail($id);

        $uploadedFiles = $request->getUploadedFiles();
        $destDirectory = Document::getFilePath($id);

        if (count($uploadedFiles) === 0) {
            throw new \Exception($this->i18n->translate('no-uploaded-files'));
        }

        $files = [];
        $errors = [];
        foreach ($uploadedFiles as $file) {
            $error = $file->getError();
            if ($error !== UPLOAD_ERR_OK) {
                $errors[$file->getClientFilename()] = $this->i18n->translate(
                    'upload-failed-error-code',
                    [$error],
                );
                continue;
            }

            $fileSize = $file->getSize();
            if ($fileSize > Config::getSettings('maxFileUploadSize')) {
                $errors[$file->getClientFilename()] = $this->i18n->translate('file-exceeds-max-size');
                continue;
            }

            $fileType = $file->getClientMediaType();
            if (!in_array($fileType, Config::getSettings('authorizedFileTypes'), true)) {
                $errors[$file->getClientFilename()] = $this->i18n->translate('file-type-not-allowed');
                continue;
            }

            $filename = moveUploadedFile($destDirectory, $file);
            if (!$filename) {
                $errors[$file->getClientFilename()] = $this->i18n->translate('saving-uploaded-file-failed');
                continue;
            }

            $files[] = [
                'material_id' => $id,
                'name' => $filename,
                'type' => $fileType,
                'size' => $file->getSize(),
            ];
        }

        foreach ($files as $document) {
            try {
                Document::updateOrCreate(
                    ['material_id' => $id, 'name' => $document['name']],
                    $document
                );
            } catch (\Exception $e) {
                $filePath = Document::getFilePath($id, $document['name']);
                unlink($filePath);
                $errors[$document['name']] = $this->i18n->translate(
                    'document-cannot-be-saved-in-db',
                    [$e->getMessage()],
                );
            }
        }

        if (count($errors) > 0) {
            throw new \Exception(implode("\n", $errors));
        }

        return $response->withJson($files, StatusCode::STATUS_OK);
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
