<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

trait CamelCase
{
    public function collectionToCamelCase(Collection $data): array
    {
        $camelCaseData = [];
        foreach ($data->toArray() as $entry) {
            $entryData = [];
            foreach ($entry as $key => $value) {
                $entryData[Str::camel($key)] = $value;
            }

            $camelCaseData[] = $entryData;
        }

        return $camelCaseData;
    }
}
