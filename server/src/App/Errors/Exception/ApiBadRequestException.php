<?php
declare(strict_types=1);

namespace Loxya\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Errors\Enums\ApiErrorCode;

class ApiBadRequestException extends ApiException
{
    public function __construct(ApiErrorCode $code, string $message = 'Bad request.')
    {
        parent::__construct($code, $message, StatusCode::STATUS_BAD_REQUEST);
    }
}
