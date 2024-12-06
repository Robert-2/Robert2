<?php
declare(strict_types=1);

namespace Loxya\Models\Casts;

use Brick\Math\BigDecimal as Decimal;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes;

final class AsDecimal implements CastsAttributes, SerializesCastableAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return $value !== null ? Decimal::of($value) : null;
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return $value !== null ? (string) $value : null;
    }

    public function serialize($model, string $key, $value, array $attributes)
    {
        return $value !== null ? (string) $value : null;
    }
}
