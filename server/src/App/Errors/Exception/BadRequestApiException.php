<?php
declare(strict_types=1);

namespace Robert2\API\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

class BadRequestApiException extends ApiException
{
    public function __construct($code, string $message = 'Bad request.')
    {
        parent::__construct($code, $message, StatusCode::STATUS_BAD_REQUEST);
    }
}
