<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Illuminate\Database\Eloquent\Builder;
use Slim\Http\ServerRequest as Request;

abstract class BaseController
{
    /** @var Container */
    protected $container;

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    /**
     * @param Request  $request
     * @param Builder  $query
     * @param int|null $limit
     *
     * @return array
     */
    protected function paginate(Request $request, $query, ?int $limit = null): array
    {
        $maxItemsPerPage = $this->container->get('settings')['maxItemsPerPage'] ?? 100;
        $limit = min($limit ? (int)$limit : $maxItemsPerPage, $maxItemsPerPage);

        $paginated = $query->paginate($limit);
        $basePath = $request->getUri()->getPath();
        $params = $request->getQueryParams();

        $result = $paginated
            ->withPath($basePath)
            ->appends($params);

        return [
            'pagination' => [
                'perPage' => $result->perPage(),
                'currentPage' => $result->currentPage(),
                'total' => [
                    'items' => $result->total(),
                    'pages' => $result->lastPage(),
                ],
            ],
            // TODO: Enlever le `->toArray()` pour profiter de la serialization des modèles ...
            'data' => $result->getCollection()->toArray(),
        ];
    }
}
