<?php
declare(strict_types=1);

namespace Loxya\Models\Traits;

use Adbar\Dot as DotArray;
use Brick\Math\BigDecimal as Decimal;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Collection;
use Loxya\Contracts\Serializable;

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

        // @phpstan-ignore-next-line
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
    // -    Méthodes utilitaires
    // -
    // ------------------------------------------------------

    public static function serializeValidation(array $data): array
    {
        if (!property_exists(static::class, 'serializedNames')) {
            return $data;
        }

        $data = new DotArray($data);

        // @phpstan-ignore-next-line
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

        // @phpstan-ignore-next-line
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
    // -    Méthodes internes
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

        $serialize = function ($value) {
            if ($value instanceof Serializable) {
                return $value->serialize();
            }

            if ($value instanceof Decimal) {
                return (string) $value;
            }

            if ($value instanceof \DateTimeInterface) {
                return $this->serializeDate($value);
            }

            if ($value instanceof Arrayable) {
                return $value->toArray();
            }

            return $value;
        };

        if ($value instanceof Collection) {
            return $value
                ->map(static fn ($value) => $serialize($value))
                ->all();
        }

        return $serialize($value);
    }
}
