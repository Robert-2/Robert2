<?php
namespace Robert2\API\Errors;

class ErrorHandler
{
    public function __construct($container)
    {
        $this->container = $container;
    }

    public function __invoke($request, $response, $exception)
    {
        if ($this->container->settings["displayErrorDetails"] === true) {
            return $this->developpementResponse($request, $response, $exception);
        }
        // @codeCoverageIgnoreStart
        return $this->productionResponse($request, $response, $exception);
        // @codeCoverageIgnoreEnd
    }

    /**
     * @codeCoverageIgnore
     */
    private function productionResponse($request, $response, $exception)
    {
        $errorCode = $exception->getCode() ?: ERROR_SERVER;
        $output = [
            'success' => false,
            'error'   => [
                'code'    => $errorCode,
                'message' => $exception->getMessage(),
            ]
        ];

        if (method_exists($exception, 'getValidationErrors')) {
            $output['error']['details'] = $exception->getValidationErrors();
        }

        $this->container->logger->error($exception->getMessage());
        $this->container->logger->error($exception->getTraceAsString() . "\n");

        if ($errorCode >= 100 and $errorCode <= 599) {
            return $response->withJson($output, $errorCode);
        }

        return $response->withJson($output, ERROR_SERVER);
    }

    private function developpementResponse($request, $response, $exception)
    {
        $requested = sprintf(
            '(%s) %s',
            $request->getMethod(),
            $request->getUri()
        );

        $file = sprintf(
            '%s, line %s.',
            $exception->getFile(),
            $exception->getLine()
        );

        $errorCode = $exception->getCode() ?: ERROR_SERVER;

        $output = [
            'success' => false,
            'error'   => [
                'requested'  => $requested,
                'code'       => $errorCode,
                'message'    => $exception->getMessage(),
                'file'       => $file,
                'stackTrace' => $exception->getTrace()
            ]
        ];

        if (method_exists($exception, 'getValidationErrors')) {
            $output['error'] = [
                'code'    => $errorCode,
                'message' => $exception->getMessage(),
                'details' => $exception->getValidationErrors()
            ];
        }

        if ($errorCode < 100 || $errorCode > 599) {
            $errorCode = ERROR_SERVER;
        }

        if ($errorCode === ERROR_NOT_FOUND) {
            unset($output['error']['details']);
            unset($output['error']['stackTrace']);
        }

        return $response->withJson($output, $errorCode);
    }
}
