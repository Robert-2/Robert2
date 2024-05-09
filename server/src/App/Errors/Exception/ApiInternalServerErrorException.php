<?php
declare(strict_types=1);

namespace Loxya\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Errors\Enums\ApiErrorCode;

class ApiInternalServerErrorException extends ApiException
{
    public function __construct(ApiErrorCode $code, string $message = 'Internal server error.')
    {
        parent::__construct($code, $message, StatusCode::STATUS_INTERNAL_SERVER_ERROR);
    }
}
