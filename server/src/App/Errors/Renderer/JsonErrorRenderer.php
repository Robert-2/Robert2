<?php
declare(strict_types=1);

namespace Robert2\API\Errors\Renderer;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Errors\ValidationException;
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

    // FIXME: La clé `code` des erreurs ne devrait pas contenir les codes HTTP...
    //        Cette clé devrait contenir uniquement les codes internes lorsque défini, un code `UNKNOWN` sinon.
    //        (Le code HTTP est déjà récupérable via le status de réponse, à corriger côté front avant toute chose)
    private static function format(\Throwable $exception, bool $displayErrorDetails): array
    {
        $output = [
            'code' => $exception->getCode() ?: StatusCode::STATUS_INTERNAL_SERVER_ERROR,
            'message' => $exception->getMessage(),
        ];

        if ($exception instanceof ModelNotFoundException) {
            $output['code'] = StatusCode::STATUS_NOT_FOUND;
            $output['message'] = "Not found."; // "Entity not found."
            return $output;
        }

        if ($exception instanceof ValidationException) {
            $output['details'] = $exception->getValidationErrors();
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
                $output['debug'] = ['requested' => $requestDetail];
            }
            return $output;
        }

        if ($output['code'] === StatusCode::STATUS_NOT_FOUND) {
            return $output;
        }

        if ($displayErrorDetails) {
            $output['debug'] = [
                'file' => sprintf('%s, line %s.', $exception->getFile(), $exception->getLine()),
                'stackTrace' => $exception->getTrace(),
            ];
        }

        return $output;
    }
}
