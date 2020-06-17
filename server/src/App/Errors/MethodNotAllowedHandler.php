<?php
namespace Robert2\API\Errors;

class MethodNotAllowedHandler
{
    public function __invoke($request, $response, $methods)
    {
        $output = [
            'success' => false,
            'error'   => [
                'code'      => 405,
                'message'   => 'Method not allowed',
                'requested' => sprintf(
                    'Method must be one of: [%s]. You asked: (%s) %s',
                    implode(', ', $methods),
                    $request->getMethod(),
                    $request->getUri()
                )
            ]
        ];

        return $response->withJson($output, 405);
    }
}
