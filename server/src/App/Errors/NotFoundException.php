<?php
namespace Robert2\API\Errors;

class NotFoundException extends \Exception
{
    public function __construct(string $message = null)
    {
        $message = $message ?: "The required resource was not found.";
        parent::__construct($message, ERROR_NOT_FOUND, null);
    }
}
