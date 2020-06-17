<?php
namespace Robert2\API\Errors;

class NotFoundHandler
{
    public function __invoke($request, $response, $args = null)
    {
        $output = [
            'success' => false,
            'error'   => [
                'requested' => sprintf(
                    '(%s) %s',
                    $request->getMethod(),
                    $request->getUri()
                ),
                'code'    => ERROR_NOT_FOUND,
                'message' => 'Route Not found'
            ]
        ];

        return $response->withJson($output, ERROR_NOT_FOUND);
    }
}
