<?php

namespace Robert2\API\Validation\Exceptions;

use Respect\Validation\Exceptions\ValidationException;

class UuidException extends ValidationException
{
    public static $defaultTemplates = [
        self::MODE_DEFAULT => [self::STANDARD => 'invalid-uuid'],
    ];
}
