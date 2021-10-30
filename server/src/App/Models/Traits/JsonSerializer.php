<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use Illuminate\Support\Str;

trait JsonSerializer
{
    public function jsonSerialize()
    {
        $data = $this->toArray();

        $camelCaseData = [];
        foreach ($data as $key => $value) {
            $camelCaseData[Str::camel($key)] = $value;
        }

        return $camelCaseData;
    }
}
