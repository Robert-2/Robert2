<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\Builder;
use Loxya\Controllers\Traits\Crud;
use Loxya\Http\Request;
use Loxya\Models\Attribute;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

final class AttributeController extends BaseController
{
    use Crud\GetOne;
    use Crud\Create;
    use Crud\Update;
    use Crud\HardDelete;

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $categoryId = $request->getQueryParam('category', null);

        $attributes = Attribute::query()
            ->when(
                $categoryId !== null,
                static function (Builder $subQuery) use ($categoryId) {
                    $subQuery->whereDoesntHave('categories');

                    if ($categoryId !== 'none') {
                        $subQuery->orWhereRelation('categories', 'categories.id', $categoryId);
                    }
                },
            )
            ->with(['categories'])
            ->orderBy('name', 'asc')
            ->get();

        $data = $attributes->map(static fn ($attribute) => static::_formatOne($attribute));
        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected static function _formatOne(Attribute $attribute): array
    {
        return $attribute->serialize(Attribute::SERIALIZE_DETAILS);
    }
}
