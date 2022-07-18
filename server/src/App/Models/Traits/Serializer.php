<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use Illuminate\Support\Str;

trait Serializer
{
    protected function serialize(): array
    {
        $data = $this->toArray();

        if (property_exists($this, 'serializedNames')) {
            foreach ($this->serializedNames as $originalName => $alias) {
                $data[$alias] = $data[$originalName] ?? null;
                unset($data[$originalName]);
            }
            return $data;
        }

        $camelCaseData = [];
        foreach ($data as $key => $value) {
            $camelCaseData[Str::camel($key)] = $value;
        }

        return $camelCaseData;
    }

    protected function unserialize(array $data): array
    {
        if (!property_exists($this, 'serializedNames')) {
            return $data;
        }

        foreach ($this->serializedNames as $originalName => $alias) {
            if (array_key_exists($alias, $data)) {
                if (!array_key_exists($originalName, $data)) {
                    $data[$originalName] = $data[$alias];
                }
                unset($data[$alias]);
            }
        }

        return $data;
    }
}
