<?php
namespace Robert2\API\Errors;

class ValidationException extends \Exception
{
    protected $code;
    protected $errors;

    public function __construct(array $errors = [])
    {
        $this->code = ERROR_VALIDATION;
        $this->errors = $errors;

        $message = "Validation failed. See error[details] for more informations.";
        parent::__construct($message, ERROR_VALIDATION, null);
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getValidationErrors()
    {
        return $this->errors;
    }
}
