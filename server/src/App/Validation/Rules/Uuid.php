<?php

namespace Robert2\API\Validation\Rules;

use Respect\Validation\Exceptions\ComponentException;
use Respect\Validation\Rules\AbstractRule;

// TODO: A supprimer lorsqu'on sera passé à Respect/Validation 2.x
// @see https://github.com/Respect/Validation/blob/master/library/Rules/Uuid.php
class Uuid extends AbstractRule
{
    private const PATTERN_FORMAT = '/^[0-9a-f]{8}-[0-9a-f]{4}-%s[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i';

    private $version;

    public function __construct(?int $version = null)
    {
        if ($version !== null && !$this->isSupportedVersion($version)) {
            throw new ComponentException(sprintf('Only versions 1, 3, 4, and 5 are supported: %d given', $version));
        }

        $this->version = $version;
    }

    public function validate($input): bool
    {
        if (!is_string($input)) {
            return false;
        }

        return preg_match($this->getPattern(), $input) > 0;
    }

    private function isSupportedVersion(int $version): bool
    {
        return $version >= 1 && $version <= 5 && $version !== 2;
    }

    private function getPattern(): string
    {
        if ($this->version !== null) {
            return sprintf(self::PATTERN_FORMAT, $this->version);
        }

        return sprintf(self::PATTERN_FORMAT, '[13-5]');
    }
}
