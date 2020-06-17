<?php
namespace Robert2\API\Errors;

class UnauthorizedException extends \Exception
{
    public function __construct(string $message = null)
    {
        $message = $message ?: "Access denied.";
        parent::__construct($message, ERROR_UNAUTHORIZED, null);
    }
}
