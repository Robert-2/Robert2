<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\Builder;
use Loxya\Controllers\Traits\Crud;
use Loxya\Http\Request;
use Loxya\Models\Attribute;
use Loxya\Models\Enums\AttributeEntity;
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
        $categoryId = $request->getQueryParam('category');
        $entity = $request->getEnumQueryParam('entity', AttributeEntity::class);

        $attributes = Attribute::query()
            ->when($categoryId !== null, static fn (Builder $query) => (
                $query
                    ->whereDoesntHave('categories')
                    ->when($categoryId !== 'none', static fn (Builder $subQuery) => (
                        $subQuery->orWhereRelation('categories', 'categories.id', $categoryId)
                    ))
            ))
            ->when($entity !== null, static fn (Builder $query) => (
                $query->forEntity($entity)
            ))
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
