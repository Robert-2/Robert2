<?php
declare(strict_types=1);

namespace Loxya\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

class ApiForbiddenException extends ApiException
{
    public function __construct($code, string $message = 'Forbidden.')
    {
        parent::__construct($code, $message, StatusCode::STATUS_FORBIDDEN);
    }
}
