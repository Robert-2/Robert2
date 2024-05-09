<?php
declare(strict_types=1);

namespace Loxya\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Errors\Enums\ApiErrorCode;

class ApiForbiddenException extends ApiException
{
    public function __construct(ApiErrorCode $code, string $message = 'Forbidden.')
    {
        parent::__construct($code, $message, StatusCode::STATUS_FORBIDDEN);
    }
}
