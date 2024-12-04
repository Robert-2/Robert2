<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\Builder;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Http\Request;
use Loxya\Models\Material;
use Loxya\Models\Park;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;

final class ParkController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $search = $request->getStringQueryParam('search');
        $limit = $request->getIntegerQueryParam('limit');
        $ascending = $request->getBooleanQueryParam('ascending', true);
        $onlyDeleted = $request->getBooleanQueryParam('deleted', false);

        $query = Park::query()
            ->when(
                $search !== null && mb_strlen($search) >= 2,
                static fn (Builder $subQuery) => $subQuery->search($search),
            )
            ->when($onlyDeleted, static fn (Builder $subQuery) => (
                $subQuery->onlyTrashed()
            ))
            ->orderBy('name', $ascending ? 'asc' : 'desc');

        $results = $this->paginate($request, $query, $limit);
        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getList(Request $request, Response $response): ResponseInterface
    {
        $parks = Park::query()
            ->orderBy('name')
            ->get();

        $data = $parks->map(static fn ($park) => $park->serialize(Park::SERIALIZE_SUMMARY));
        return $response->withJson($data, StatusCode::STATUS_OK);
    }

    public function getOneMaterials(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        if (!Park::includes($id)) {
            throw new HttpNotFoundException($request);
        }

        $materials = Material::getParkAll($id);
        return $response->withJson($materials, StatusCode::STATUS_OK);
    }

    public function getOneTotalAmount(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        /** @var Park $park */
        $park = Park::findOrFail($id);

        return $response->withJson($park->total_amount, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected static function _formatOne(Park $park): array
    {
        return $park->serialize(Park::SERIALIZE_DETAILS);
    }
}
