<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Loxya\Errors\Exception\HttpRangeNotSatisfiableException;
use Loxya\Http\Request;

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
        $limit = min($limit ? (int) $limit : $maxItemsPerPage, $maxItemsPerPage);

        /** @var LengthAwarePaginator $paginated */
        $paginated = $query->paginate($limit);
        $basePath = $request->getUri()->getPath();
        $params = $request->getQueryParams();

        $result = $paginated
            ->withPath($basePath)
            ->appends($params);

        if ($result->currentPage() > $result->lastPage()) {
            throw new HttpRangeNotSatisfiableException(
                $request,
                "Current page number cannot be greater than total pages.",
            );
        }

        return [
            'pagination' => [
                'perPage' => $result->perPage(),
                'currentPage' => $result->currentPage(),
                'total' => [
                    'items' => $result->total(),
                    'pages' => $result->lastPage(),
                ],
            ],
            'data' => $result->getCollection(),
        ];
    }
}
