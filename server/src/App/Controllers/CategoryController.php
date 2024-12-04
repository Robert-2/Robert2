<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\Crud;
use Loxya\Http\Request;
use Loxya\Models\Category;
use Loxya\Services\I18n;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

final class CategoryController extends BaseController
{
    use Crud\Create;
    use Crud\Update;
    use Crud\HardDelete;

    private I18n $i18n;

    public function __construct(Container $container, I18n $i18n)
    {
        parent::__construct($container);

        $this->i18n = $i18n;
    }

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $categories = Category::orderBy('name', 'asc')
            ->with(['subCategories'])
            ->get();

        $categories = $categories->map(static fn ($category) => static::_formatOne($category));
        return $response->withJson($categories, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected static function _formatOne(Category $category): array
    {
        return $category->serialize(Category::SERIALIZE_DETAILS);
    }
}
