<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use Adbar\Dot as DotArray;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Collection;
use Robert2\API\Contracts\Serializable;

/**
 * @property array<string, string> $serializedNames
 */
trait Serializer
{
    public function serialize(): array
    {
        $data = $this->attributesForSerialization();

        if (!property_exists(static::class, 'serializedNames')) {
            return $data;
        }

        $data = new DotArray($data);

        foreach (static::$serializedNames as $originalPath => $aliasPath) {
            if ($aliasPath !== null) {
                $data->set($aliasPath, $data->get($originalPath, null));
            }
            $data->delete($originalPath);
        }

        return $data->all();
    }

    // ------------------------------------------------------
    // -
    // -    Utils methods
    // -
    // ------------------------------------------------------

    public static function serializeValidation(array $data): array
    {
        if (!property_exists(static::class, 'serializedNames')) {
            return $data;
        }

        $data = new DotArray($data);

        foreach (static::$serializedNames as $originalPath => $aliasPath) {
            if ($data->has($originalPath) && !$data->has($aliasPath)) {
                $data->set($aliasPath, $data->get($originalPath));
            }
            $data->delete($originalPath);
        }

        return $data->all();
    }

    public static function unserialize(array $data): array
    {
        if (!property_exists(static::class, 'serializedNames')) {
            return $data;
        }

        $data = new DotArray($data);

        foreach (static::$serializedNames as $originalPath => $aliasPath) {
            if ($data->has($aliasPath) && !$data->has($originalPath)) {
                $data->set($originalPath, $data->get($aliasPath));
            }
            $data->delete($aliasPath);
        }

        return $data->all();
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected function attributesForSerialization()
    {
        $attributes = $this->getArrayableAttributes();
        $attributes = $this->addDateAttributesToArray($attributes);

        // - Mutateurs
        $mutatedAttributes = $this->getMutatedAttributes();
        foreach ($mutatedAttributes as $key) {
            if (!array_key_exists($key, $attributes)) {
                continue;
            }
            $attributes[$key] = $this->mutateAttributeForSerialization($key, $attributes[$key]);
        }

        // - Casts
        $attributes = $this->addCastAttributesToArray($attributes, $mutatedAttributes);

        // - Appends
        foreach ($this->getArrayableAppends() as $key) {
            $attributes[$key] = $this->mutateAttributeForSerialization($key, null);
        }

        return $attributes;
    }

    protected function mutateAttributeForSerialization($key, $value)
    {
        $value = $this->isClassCastable($key)
            ? $this->getClassCastableAttributeValue($key, $value)
            : $this->mutateAttribute($key, $value);

        if ($value instanceof Collection) {
            return $value
                ->map(function ($value) {
                    if ($value instanceof Serializable) {
                        return $value->serialize();
                    }

                    if ($value instanceof Arrayable) {
                        return $value->toArray();
                    }

                    return $value;
                })
                ->all();
        }

        if ($value instanceof Serializable) {
            return $value->serialize();
        }

        if ($value instanceof Arrayable) {
            return $value->toArray();
        }

        return $value;
    }
}
