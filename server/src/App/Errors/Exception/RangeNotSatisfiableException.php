<?php
declare(strict_types=1);

namespace Robert2\API\Errors\Exception;

use Slim\Exception\HttpSpecializedException;
use Fig\Http\Message\StatusCodeInterface as StatusCode;

class RangeNotSatisfiableException extends HttpSpecializedException
{
    protected $code = StatusCode::STATUS_RANGE_NOT_SATISFIABLE;
    protected $message = 'Range Not Satisfiable.';
}
