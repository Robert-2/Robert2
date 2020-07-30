<?php
namespace Robert2\API\Errors;

use Illuminate\Database\QueryException;

class ValidationException extends \Exception
{
    private $_validation;
    protected $code;

    public function __construct(int $code = ERROR_VALIDATION)
    {
        $this->code = $code;

        $message = "Validation failed. See error[details] for more informations.";

        parent::__construct($message, $code, null);
    }

    public function setValidationErrors($validation)
    {
        $this->_validation = (array)$validation;
    }

    public function getValidationErrors()
    {
        return $this->_validation;
    }

    /**
     * Parses PDO error codes to translate them into error exceptions
     */
    public function setPDOValidationException(QueryException $e): void
    {
        $message = "";
        $details = $e->getMessage();

        if (isDuplicateException($e)) {
            $this->code = ERROR_DUPLICATE;
            $offsetKeyName = strripos($details, "for key '") + strlen("for key '");
            $keyNameWithoutUnique = substr($details, $offsetKeyName, - strlen("_UNIQUE'"));
            $message = "Duplicate entry: index $keyNameWithoutUnique must be unique";
        }

        $this->setValidationErrors([$message, $details]);
    }
}
