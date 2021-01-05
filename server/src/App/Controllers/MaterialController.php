<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Errors;
use Robert2\API\Models\Attribute;
use Robert2\API\Models\Event;
use Robert2\API\Controllers\Traits\Taggable;
use Slim\Http\Request;
use Slim\Http\Response;

class MaterialController extends BaseController
{
    use Taggable;

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
        $withDeleted = (bool)$request->getQueryParam('deleted', false);
        $tags = $request->getQueryParam('tags', []);
        $whileEvent = $request->getQueryParam('whileEvent', null);
        $onlySelectedInEvent = $request->getQueryParam('onlySelectedInEvent', null);

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

        $model = $this->model
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField);

        if (empty($options) && empty($tags)) {
            $model = $model->getAll($withDeleted);
        } else {
            $model = $model->getAllFilteredOrTagged($options, $tags, $withDeleted);
        }

        if ($onlySelectedInEvent) {
            $model = $model->whereHas('events', function ($query) use ($onlySelectedInEvent) {
                $query->where('event_id', $onlySelectedInEvent);
            });
        }

        $results = $model->paginate($this->itemsCount);

        $basePath = $request->getUri()->getPath();
        $params = $request->getQueryParams();
        $results = $results->withPath($basePath)->appends($params);
        $results = $this->_formatPagination($results);

        if ($whileEvent) {
            $eventId = (int)$whileEvent;
            $Event = new Event();
            $currentEvent = $Event->find($eventId);

            if ($currentEvent) {
                $results['data'] = $this->model->recalcQuantitiesForPeriod(
                    $results['data'],
                    $currentEvent->start_date,
                    $currentEvent->end_date,
                    $eventId
                );
            }
        }

        return $response->withJson($results);
    }

    public function getAttributes(Request $request, Response $response): Response
    {
        $attributes = new Attribute();
        $result = $attributes->getAll()->get();
        return $response->withJson($result->toArray());
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function create(Request $request, Response $response): Response
    {
        $postData = $request->getParsedBody();

        $result = $this->_saveMaterial(null, $postData);
        return $response->withJson($result, SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->model->find($id);
        if (!$model) {
            throw new Errors\NotFoundException;
        }

        $postData = $request->getParsedBody();

        $result = $this->_saveMaterial($id, $postData);
        return $response->withJson($result, SUCCESS_OK);
    }

    // ------------------------------------------------------
    // —
    // —    Internal Methods
    // —
    // ------------------------------------------------------

    protected function _saveMaterial(?int $id, array $postData): array
    {
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        if (isset($postData['stock_quantity'])) {
            $stockQuantity = (int)$postData['stock_quantity'];
            if ($stockQuantity !== null && (int)$stockQuantity < 0) {
                $postData['stock_quantity'] = 0;
            }
        }

        if (isset($postData['out_of_order_quantity'])) {
            $stockQuantity = $postData['stock_quantity'] ?? 0;
            $outOfOrderQuantity = (int)$postData['out_of_order_quantity'];
            if ($outOfOrderQuantity > (int)$stockQuantity) {
                $outOfOrderQuantity = (int)$stockQuantity;
                $postData['out_of_order_quantity'] = $outOfOrderQuantity;
            }
            if ($outOfOrderQuantity <= 0) {
                $postData['out_of_order_quantity'] = null;
            }
        }

        $result = $this->model->edit($id, $postData);

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

        $model = $this->model->find($result->id);
        return $model->toArray();
    }
}
