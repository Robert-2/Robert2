<?php
declare(strict_types=1);

namespace Loxya\Errors\Exception;

use Slim\Exception\HttpSpecializedException;
use Fig\Http\Message\StatusCodeInterface as StatusCode;

class HttpConflictException extends HttpSpecializedException
{
    protected $code = StatusCode::STATUS_CONFLICT;
    protected $message = 'Conflict.';
}
