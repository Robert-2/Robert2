<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use InvalidArgumentException;
use Robert2\API\Config\Config;
use Robert2\API\Controllers\Traits\FileResponse;
use Robert2\API\Controllers\Traits\Taggable;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\Document;
use Robert2\API\Models\Enums\Group;
use Robert2\API\Models\Event;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Robert2\API\Services\Auth;
use Robert2\API\Services\I18n;
use Robert2\Lib\Domain\MaterialsData;
use Robert2\Lib\Pdf\Pdf;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpForbiddenException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;
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
        $id = (int)$request->getAttribute('id');
        $material = Material::findOrFail($id);
        return $response->withJson($material);
    }

    public function getAll(Request $request, Response $response): Response
    {
        $paginated = (bool)$request->getQueryParam('paginated', true);
        $searchTerm = $request->getQueryParam('search', null);
        $searchField = $request->getQueryParam('searchBy', null);
        $parkId = $request->getQueryParam('park', null);
        $categoryId = $request->getQueryParam('category', null);
        $subCategoryId = $request->getQueryParam('subCategory', null);
        $dateForQuantities = $request->getQueryParam('dateForQuantities', null);
        $withDeleted = (bool)$request->getQueryParam('deleted', false);
        $tags = $request->getQueryParam('tags', []);

        $options = [];
        if ($parkId) {
            $options['park_id'] = (int)$parkId;
        }
        if ($categoryId) {
            $options['category_id'] = $categoryId !== 'uncategorized'
                ? (int)$categoryId
                : null;
        }
        if ($subCategoryId) {
            $options['sub_category_id'] = (int)$subCategoryId;
        }

        $orderBy = $request->getQueryParam('orderBy', null);
        $ascending = (bool)$request->getQueryParam('ascending', true);

        $model = (new Material)
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField);

        if (empty($options) && empty($tags)) {
            $model = $model->getAll($withDeleted);
        } else {
            $model = $model->getAllFilteredOrTagged($options, $tags, $withDeleted);
        }

        if ($paginated) {
            $results = $this->paginate($request, $model);
            $results['data'] = $results['data'];
        } else {
            $results = ['data' => $model->get()];
        }

        // - Filtre des quantités pour une date ou une période donnée
        if (!is_array($dateForQuantities)) {
            $dateForQuantities = array_fill_keys(['start', 'end'], $dateForQuantities);
        }
        if (empty($dateForQuantities['start']) ||
            !is_string($dateForQuantities['start']) ||
            empty($dateForQuantities['end']) ||
            !is_string($dateForQuantities['end'])
        ) {
            $dateForQuantities = array_fill_keys(['start', 'end'], null);
        }

        $results['data'] = Material::withAvailabilities(
            $results['data'],
            $dateForQuantities['start'],
            $dateForQuantities['end']
        );

        $results['data'] = $results['data']->map(function ($material) {
            $material->append('available_quantity');
            return $material->serialize();
        });

        $results = $paginated ? $results : $results['data'];
        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getAllWhileEvent(Request $request, Response $response): Response
    {
        $eventId = (int)$request->getAttribute('eventId');

        $currentEvent = Event::find($eventId);
        if (!$currentEvent) {
            throw new HttpNotFoundException($request);
        }

        $materials = (new Material)
            ->setOrderBy('reference', true)
            ->getAll()
            ->get();

        $materials = Material::withAvailabilities(
            $materials,
            $currentEvent->start_date,
            $currentEvent->end_date,
            $eventId
        );

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
            if ($onlyParkId && (int) $onlyParkId !== $park->id) {
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
                'materials' => (new MaterialsData($parkMaterials))->getBySubCategories(true),
            ];
        }

        usort($parksMaterials, function ($a, $b) {
            return strcmp($a['name'], $b['name'] ?: '');
        });

        // - Nom du parc (si export pour un seul parc)
        $parkOnlyName = null;
        if ($onlyParkId) {
            $parksName = $parks->pluck('name', 'id')->all();
            if (array_key_exists($onlyParkId, $parksName)) {
                $parkOnlyName = $parksName[$onlyParkId];
            }
        }

        // - Date.
        $date = new \DateTimeImmutable();
        if (Config::getEnv() === 'test') {
            $date = new \DateTimeImmutable('2022-09-23');
        }

        $company = Config::getSettings('companyData');
        $fileName = sprintf(
            '%s-%s-%s.pdf',
            slugify($this->i18n->translate('materials-list')),
            slugify($parkOnlyName ?: $company['name']),
            (new \DateTime())->format('Y-m-d')
        );
        if (Config::getEnv() === 'test') {
            $fileName = sprintf('TEST-%s', $fileName);
        }

        $data = [
            'date' => $date,
            'company' => $company,
            'parkOnlyName' => $parkOnlyName,
            'currency' => Config::getSettings('currency')['iso'],
            'parksMaterialsList' => $parksMaterials,
        ];

        $fileContent = Pdf::createFromTemplate('materials-list-default', $data);
        return $this->_responseWithFile($response, $fileName, $fileContent);
    }

    public function getAllDocuments(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $material = Material::findOrFail($id);

        return $response->withJson($material->documents, StatusCode::STATUS_OK);
    }

    public function getEvents(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $material = Material::findOrFail($id);

        $collection = [];
        $useMultipleParks = Park::count() > 1;
        foreach ($material->events as $event) {
            $event = $event->append([
                'has_missing_materials',
                'has_not_returned_materials',
            ]);

            $collection[] = array_replace($event->serialize(), [
                'pivot' => $event->pivot->toArray(),
                'parks' => $useMultipleParks
                    ? Event::getParks($event->materials)
                    : null
            ]);
        }

        return $response->withJson($collection, StatusCode::STATUS_OK);
    }

    public function getPicture(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
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
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $material = $this->_saveMaterial(null, $postData);

        $materialData = $this->_getSafeMaterialSerializedData($material);
        return $response->withJson($materialData, StatusCode::STATUS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $material = Material::findOrFail($id);

        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $material = $this->_saveMaterial($id, $postData);

        $materialData = $this->_getSafeMaterialSerializedData($material);
        return $response->withJson($materialData, StatusCode::STATUS_OK);
    }

    public function handleUploadDocuments(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
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
            if (!in_array($fileType, Config::getSettings('authorizedFileTypes'))) {
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
            if ($stockQuantity !== null && (int)$stockQuantity < 0) {
                $postData['stock_quantity'] = 0;
            }
        }

        if (array_key_exists('out_of_order_quantity', $postData)) {
            $stockQuantity = (int)($postData['stock_quantity'] ?? 0);
            $outOfOrderQuantity = (int)$postData['out_of_order_quantity'];
            if ($outOfOrderQuantity > $stockQuantity) {
                $outOfOrderQuantity = $stockQuantity;
                $postData['out_of_order_quantity'] = $outOfOrderQuantity;
            }
            if ($outOfOrderQuantity <= 0) {
                $postData['out_of_order_quantity'] = null;
            }
        }

        $material = Material::staticEdit($id, $postData);

        if (isset($postData['attributes'])) {
            $attributes = [];
            foreach ($postData['attributes'] as $attribute) {
                if (empty($attribute['value'])) {
                    continue;
                }

                $attributes[$attribute['id']] = [
                    'value' => (string)$attribute['value']
                ];
            }
            $material->attributes()->sync($attributes);
            $material->refresh();
        }

        return $material;
    }

    protected function _getSafeMaterialSerializedData(Material $material): array
    {
        $materialData = $material->serialize();

        return $materialData;
    }
}
