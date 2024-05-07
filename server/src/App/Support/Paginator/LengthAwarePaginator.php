<?php
declare(strict_types=1);

namespace Loxya\Support\Paginator;

use Illuminate\Pagination\LengthAwarePaginator as LengthAwarePaginatorCore;
use Loxya\Contracts\Serializable;

final class LengthAwarePaginator extends LengthAwarePaginatorCore
{
    public function toArray()
    {
        return [
            'pagination' => [
                'perPage' => $this->perPage(),
                'currentPage' => $this->currentPage(),
                'total' => [
                    'items' => $this->total(),
                    'pages' => $this->lastPage(),
                ],
            ],
            'data' => $this->getCollection()
                ->map(static function ($value) {
                    if ($value instanceof Serializable) {
                        return $value->serialize();
                    }
                    return $value->toArray();
                })
                ->all(),
        ];
    }
}
