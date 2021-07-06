<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Robert2\API\Config\Config;
use Robert2\API\Controllers\Traits\Taggable;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Controllers\Traits\FileResponse;
use Robert2\Lib\Pdf\Pdf;
use Robert2\Lib\Domain\MaterialsData;
use Robert2\API\Models\Document;
use Robert2\API\Models\Event;
use Robert2\API\Models\Material;
use Robert2\API\Models\Category;
use Robert2\API\Models\Park;
use Robert2\API\Services\I18n;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class MaterialController extends BaseController
{
    use WithCrud, FileResponse, Taggable {
        Taggable::getAll insteadof WithCrud;
    }

    /** @var I18n */
    private $i18n;

    public function __construct(Container $container, I18n $i18n)
    {
        parent::__construct($container);

        $this->i18n = $i18n;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(Request $request, Response $response): Response
    {
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
            $options['category_id'] = (int)$categoryId;
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

        $results = $this->paginate($request, $model);
        if ($dateForQuantities) {
            $results['data'] = Material::recalcQuantitiesForPeriod(
                $results['data'],
                $dateForQuantities,
                $dateForQuantities,
                null
            );
        }

        return $response->withJson($results);
    }

    public function getAllWhileEvent(Request $request, Response $response): Response
    {
        $eventId = (int)$request->getAttribute('eventId');

        $currentEvent = Event::find($eventId);
        if (!$currentEvent) {
            throw new HttpNotFoundException($request);
        }

        $results = (new Material)
            ->setOrderBy('reference', true)
            ->getAll()
            ->get()
            ->toArray();

        if ($results && count($results) > 0) {
            $results = Material::recalcQuantitiesForPeriod(
                $results,
                $currentEvent->start_date,
                $currentEvent->end_date,
                $eventId
            );
        }

        return $response->withJson($results);
    }

    public function getParkAll(Request $request, Response $response): Response
    {
        $parkId = (int)$request->getAttribute('parkId');
        if (!Park::staticExists($parkId)) {
            throw new HttpNotFoundException($request);
        }

        $materials = Material::getParkAll($parkId);
        return $response->withJson($materials);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function create(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        $result = $this->_saveMaterial(null, $postData);
        return $response->withJson($result, SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Material::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $postData = (array)$request->getParsedBody();
        $result = $this->_saveMaterial($id, $postData);
        return $response->withJson($result, SUCCESS_OK);
    }

    // ------------------------------------------------------
    // —
    // —    Internal Methods
    // —
    // ------------------------------------------------------

    protected function _saveMaterial(?int $id, $postData): array
    {
        if (!is_array($postData) || empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
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

        // - Removing `picture` field because it must be edited
        //   using handleUploadPicture() method (see below)
        if (array_key_exists('picture', $postData) && !empty($postData['picture'])) {
            unset($postData['picture']);
        }

        $result = Material::staticEdit($id, $postData);

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
            $result->Attributes()->sync($attributes);
        }

        return Material::find($result->id)->toArray();
    }

    public function getAllDocuments(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = Material::find($id);
        if (!$model) {
            throw new HttpNotFoundException($request);
        }

        return $response->withJson($model->documents, SUCCESS_OK);
    }

    public function handleUploadDocuments(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Material::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $uploadedFiles = $request->getUploadedFiles();
        $destDirectory = Document::getFilePath($id);

        $errors = [];
        $files = [];
        foreach ($uploadedFiles as $file) {
            if ($file->getError() !== UPLOAD_ERR_OK) {
                $errors[$file->getClientFilename()] = 'File upload failed.';
                continue;
            }

            $fileType = $file->getClientMediaType();
            if (!in_array($fileType, Config::getSettings('authorizedFileTypes'))) {
                $errors[$file->getClientFilename()] = 'This file type is not allowed.';
                continue;
            }

            $filename = moveUploadedFile($destDirectory, $file);
            if (!$filename) {
                $errors[$file->getClientFilename()] = 'Saving file failed.';
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
                $errors[$document['name']] = sprintf(
                    'Document could not be saved in database: %s',
                    $e->getMessage()
                );
            }
        }

        if (count($errors) > 0) {
            throw new \Exception(implode("\n", $errors));
        }

        $result = [
            'saved_files' => $files,
            'errors' => $errors,
        ];
        return $response->withJson($result, SUCCESS_OK);
    }

    public function handleUploadPicture(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!Material::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $file = $request->getUploadedFiles()['picture-0'];

        if (empty($file) || $file->getError() !== UPLOAD_ERR_OK) {
            throw new \Exception("File upload failed.");
        }

        $fileType = $file->getClientMediaType();
        if (!in_array($fileType, Config::getSettings('authorizedImageTypes'))) {
            throw new \Exception("This file type is not allowed.");
        }

        $destDirectory = Material::getPicturePath($id);
        $filename = moveUploadedFile($destDirectory, $file);
        if (!$filename) {
            throw new \Exception("Saving file failed.");
        }

        $materialBefore = Material::find($id)->toArray();

        try {
            Material::staticEdit($id, ['picture' => $filename]);

            $previousPicture = $materialBefore['picture'];
            if ($previousPicture !== null && $filename !== $previousPicture) {
                $filePath = Material::getPicturePath($id, $previousPicture);
                unlink($filePath);
            }
        } catch (\Exception $e) {
            $filePath = Material::getPicturePath($id, $filename);
            unlink($filePath);
            throw new \Exception(sprintf(
                "Material picture could not be saved in database: %s",
                $e->getMessage()
            ));
        }

        $result = ['saved_files' => 1];

        return $response->withJson($result, SUCCESS_OK);
    }

    public function getEvents(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $material = Material::find($id);
        if (!$material) {
            throw new HttpNotFoundException($request);
        }

        $useMultipleParks = Park::count() > 1;

        $data = [];
        $today = (new \DateTime())->setTime(0, 0, 0);
        foreach ($material->events as $event) {
            $event['has_missing_materials'] = null;
            $event['has_not_returned_materials'] = null;
            $event['parks'] = null;

            if ($useMultipleParks) {
                $event['parks'] = Event::getParks($event['id']);
            }

            if ($event['is_archived']) {
                $data[] = $event;
                continue;
            }

            $eventEndDate = new \DateTime($event['end_date']);
            if ($eventEndDate < $today && $event['is_return_inventory_done']) {
                // TODO: ne mettre ce champ à true que si c'est LE matériel actuel ($id) qui n'a pas été retourné.
                $event['has_not_returned_materials'] = Event::hasNotReturnedMaterials($event['id']);
            }

            $data[] = $event;
        }

        return $response->withJson($data, SUCCESS_OK);
    }

    public function getPicture(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = Material::find($id);
        if (!$model) {
            throw new HttpNotFoundException($request);
        }

        $picturePath = Material::getPicturePath($id, $model->picture);

        $pictureContent = file_get_contents($picturePath);
        if (!$pictureContent) {
            throw new HttpNotFoundException($request, "The picture file cannot be found.");
        }

        $response = $response->write($pictureContent);
        $mimeType = mime_content_type($picturePath);
        return $response->withHeader('Content-Type', $mimeType);
    }

    public function getAllPdf(Request $request, Response $response): Response
    {
        $onlyParkId = $request->getQueryParam('park', null);

        $categories = Category::get()->toArray();
        $parks = Park::with('materials')->get()->each->setAppends([])->toArray();

        $parksMaterials = [];
        foreach ($parks as $park) {
            if ($onlyParkId && (int)$onlyParkId !== $park['id']) {
                continue;
            }

            if (empty($park['materials'])) {
                continue;
            }

            $materialsData = new MaterialsData(array_values($park['materials']));
            $materialsData->setParks($parks)->setCategories($categories);
            $parksMaterials[] = [
                'id' => $park['id'],
                'name' => $park['name'],
                'materials' => $materialsData->getBySubCategories(true),
            ];
        }

        usort($parksMaterials, function ($a, $b) {
            return strcmp($a['name'], $b['name'] ?: '');
        });

        $company = Config::getSettings('companyData');

        $parkOnlyName = null;
        if ($onlyParkId) {
            $parkKey = array_search($onlyParkId, array_column($parks, 'id'));
            if ($parkKey !== false) {
                $parkOnlyName = $parks[$parkKey]['name'];
            }
        }

        $fileName = sprintf(
            '%s-%s-%s.pdf',
            slugify($this->i18n->translate('materials-list')),
            slugify($parkOnlyName ?: $company['name']),
            (new \DateTime())->format('Y-m-d')
        );
        if (isTestMode()) {
            $fileName = sprintf('TEST-%s', $fileName);
        }

        $data = [
            'locale' => Config::getSettings('defaultLang'),
            'company' => $company,
            'parkOnlyName' => $parkOnlyName,
            'currency' => Config::getSettings('currency')['iso'],
            'parksMaterialsList' => $parksMaterials,
        ];

        $fileContent = Pdf::createFromTemplate('materials-list-default', $data);

        return $this->_responseWithFile($response, $fileName, $fileContent);
    }
}
