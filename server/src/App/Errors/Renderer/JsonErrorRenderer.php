<?php
declare(strict_types=1);

namespace Robert2\API\Errors\Renderer;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Errors\Enums\ApiErrorCode;
use Robert2\API\Errors\Exception\ApiException;
use Robert2\API\Errors\Exception\ValidationException;
use Slim\Exception\HttpException;
use Slim\Exception\HttpMethodNotAllowedException;
use Slim\Interfaces\ErrorRendererInterface;

class JsonErrorRenderer implements ErrorRendererInterface
{
    public function __invoke(\Throwable $exception, bool $displayErrorDetails): string
    {
        $output = [
            'success' => false,
            'error' => static::format($exception, $displayErrorDetails),
        ];
        return (string) \json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    private static function format(\Throwable $exception, bool $displayErrorDetails): array
    {
        $output = ['code' => ApiErrorCode::UNKNOWN];

        if ($exception instanceof ModelNotFoundException) {
            return $output;
        }

        if ($exception instanceof HttpException) {
            if ($displayErrorDetails) {
                $request = $exception->getRequest();
                $requestDetail = sprintf("(%s) %s", $request->getMethod(), $request->getUri());
                if ($exception instanceof HttpMethodNotAllowedException) {
                    $requestDetail = sprintf(
                        "Method must be one of: [%s]. You asked: %s",
                        implode(', ', $exception->getAllowedMethods()),
                        $requestDetail
                    );
                }
                $output['message'] = $exception->getMessage();
                $output['debug'] = ['requested' => $requestDetail];
            }
            return $output;
        }

        if ($exception instanceof ValidationException) {
            $output['code'] = ApiErrorCode::VALIDATION_FAILED;
            $output['message'] = $exception->getMessage();
            $output['details'] = $exception->getValidationErrors();
            return $output;
        }

        if ($exception instanceof ApiException) {
            $output['code'] = $exception->getCode();
            if (!empty($exception->getMessage())) {
                $output['message'] = $exception->getMessage();
            }
            return $output;
        }

        if ($displayErrorDetails) {
            $output['debug'] = [
                'file' => sprintf('%s, line %s.', $exception->getFile(), $exception->getLine()),
                'message' => $exception->getMessage(),
                'stackTrace' => $exception->getTrace(),
            ];
        }

        return $output;
    }
}
