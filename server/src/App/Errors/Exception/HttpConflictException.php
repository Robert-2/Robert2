<?php
declare(strict_types=1);

namespace Loxya\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Slim\Exception\HttpSpecializedException;

class HttpConflictException extends HttpSpecializedException
{
    protected $code = StatusCode::STATUS_CONFLICT;
    protected $message = 'Conflict.';
}
