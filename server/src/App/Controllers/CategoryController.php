<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\Crud;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Loxya\Models\Category;
use Loxya\Services\I18n;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

class CategoryController extends BaseController
{
    use Crud\HardDelete;

    /** @var I18n */
    private $i18n;

    public function __construct(Container $container, I18n $i18n)
    {
        parent::__construct($container);

        $this->i18n = $i18n;
    }

    public function getAll(Request $request, Response $response): Response
    {
        $categories = Category::orderBy('name', 'asc')
            ->with(['subCategories'])
            ->get();

        $categories = $categories->map(fn($category) => static::_formatOne($category));
        return $response->withJson($categories, StatusCode::STATUS_OK);
    }

    public function create(Request $request, Response $response): Response
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $category = static::_formatOne($this->_save(null, $postData));
        return $response->withJson($category, StatusCode::STATUS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $id = (int) $request->getAttribute('id');
        $category = static::_formatOne($this->_save($id, $postData));
        return $response->withJson($category, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected function _save(?int $id, array $postData): Category
    {
        if (empty($postData)) {
            throw new \InvalidArgumentException("No data was provided.");
        }

        return dbTransaction(function () use ($id, $postData) {
            $category = null;
            $hasFailed = false;
            $validationErrors = [];

            try {
                /** @var Category $category */
                $category = Category::staticEdit($id, $postData);
            } catch (ValidationException $e) {
                $validationErrors = $e->getValidationErrors();
                $hasFailed = true;
            }

            if ($hasFailed) {
                throw new ValidationException($validationErrors);
            }

            return $category->refresh();
        });
    }

    protected static function _formatOne(Category $category): Category
    {
        return $category->append('sub_categories');
    }
}
