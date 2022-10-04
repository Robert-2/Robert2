<?php
declare(strict_types=1);

namespace Robert2\API\Errors;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Errors\Renderer\JsonErrorRenderer;
use Slim\Exception\HttpException;
use Slim\Handlers\ErrorHandler as CoreErrorHandler;

class ErrorHandler extends CoreErrorHandler
{
    protected $defaultErrorRendererContentType = 'application/json';
    protected $defaultErrorRenderer = JsonErrorRenderer::class;

    protected $errorRenderers = [
        'application/json' => JsonErrorRenderer::class,
    ];

    protected function determineStatusCode(): int
    {
        if ($this->method === 'OPTIONS') {
            return StatusCode::STATUS_OK;
        }

        if ($this->exception instanceof ModelNotFoundException) {
            return StatusCode::STATUS_NOT_FOUND;
        }

        if ($this->exception instanceof HttpException) {
            return $this->exception->getCode();
        }

        $errorCode = (int)($this->exception->getCode() ?: StatusCode::STATUS_INTERNAL_SERVER_ERROR);
        if ($errorCode >= 100 and $errorCode <= 599) {
            return $errorCode;
        }

        return StatusCode::STATUS_INTERNAL_SERVER_ERROR;
    }

    protected function writeToErrorLog(): void
    {
        $isIgnoredException = (
            $this->exception instanceof HttpException ||
            $this->exception instanceof ModelNotFoundException ||
            $this->exception instanceof ValidationException
        );
        if ($isIgnoredException) {
            return;
        }
        parent::writeToErrorLog();
    }
}
