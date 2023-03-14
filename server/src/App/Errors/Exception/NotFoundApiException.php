<?php
declare(strict_types=1);

namespace Robert2\API\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

class NotFoundApiException extends ApiException
{
    public function __construct($code, string $message = 'Not found.')
    {
        parent::__construct($code, $message, StatusCode::STATUS_NOT_FOUND);
    }
}
