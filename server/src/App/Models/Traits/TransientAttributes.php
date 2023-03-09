<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

trait TransientAttributes
{
    private $transientAttributes = [];

    protected function setTransientAttribute(string $key, $value): void
    {
        $this->transientAttributes[$key] = $value;
    }

    protected function getTransientAttribute(string $key, $default = null)
    {
        return $this->transientAttributes[$key] ?? $default;
    }

    protected function hasTransientAttribute(string $key): bool
    {
        return isset($this->transientAttributes[$key]);
    }
}
