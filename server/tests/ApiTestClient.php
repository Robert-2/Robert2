<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Psr\Http\Message\StreamInterface as Body;
use Psr\Http\Message\UploadedFileInterface;
use Loxya\App;
use Loxya\Http\Request;
use Slim\Http\Response;
use Slim\Psr7\Factory\ServerRequestFactory;

/**
 * ApiTestClient.
 *
 * @method Body get(string $uri, ?array $query)
 * @method Body post(string $uri, ?array $data, array|UploadedFileInterface|null $files)
 * @method Body patch(string $uri, ?array $data, ?array $files)
 * @method Body put(string $uri, ?array $data, ?array $files)
 * @method Body delete(string $uri, ?array $data)
 * @method Body head(string $uri, ?array $data)
 * @method Body options(string $uri, ?array $data)
 */
class ApiTestClient
{
    public App $app;

    public Request $request;

    public Response $response;

    public function __construct(App $app)
    {
        $this->app = $app;
    }

    public function __call($method, $arguments)
    {
        $methods = [ 'get', 'post', 'patch', 'put', 'delete', 'head', 'options'];
        if (!in_array($method, $methods, true)) {
            throw new \BadMethodCallException(sprintf("%s is not supported", strtoupper($method)));
        }
        return call_user_func_array([$this, 'request'], array_merge([$method], $arguments));
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected function request(string $method, string $uri, ?array $data = null, mixed $files = null): Body
    {
        // - Request
        $method = strtoupper($method);
        $request = new Request((new ServerRequestFactory())->createServerRequest($method, $uri));
        if (!empty($data)) {
            if ($method === 'GET') {
                $request = $request->withQueryParams($data);
            } else {
                $request = $request->withParsedBody($data);
                $request = $request->withHeader('Content-Type', 'application/json');
            }
        }
        if ($files !== null && in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
            $files = !is_array($files) ? [$files] : $files;
            $request = $request->withUploadedFiles($files);
        }
        $this->request = $request;

        // - Response
        $this->response = $this->app->handle($this->request);
        return $this->response->getBody();
    }
}
