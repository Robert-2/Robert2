<?php
declare(strict_types=1);

namespace Robert2\API\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

class ForbiddenApiException extends ApiException
{
    public function __construct($code, string $message = 'Forbidden.')
    {
        parent::__construct($code, $message, StatusCode::STATUS_FORBIDDEN);
    }
}
