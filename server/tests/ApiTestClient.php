<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Adbar\Dot as DotArray;
use Loxya\App;
use Loxya\Http\Request;
use Loxya\Services\Auth;
use Psr\Http\Message\StreamInterface as Body;
use Psr\Http\Message\UploadedFileInterface;
use Slim\Http\Response;
use Slim\Psr7\Factory\ServerRequestFactory;

/**
 * ApiTestClient.
 *
 * @method Body get(string $uri, ?array $query = null)
 * @method Body post(string $uri, ?array $data = null, array|UploadedFileInterface|null $files = null)
 * @method Body patch(string $uri, ?array $data = null, ?array $files = null)
 * @method Body put(string $uri, ?array $data = null, ?array $files = null)
 * @method Body delete(string $uri, ?array $data = null)
 * @method Body head(string $uri, ?array $data = null)
 * @method Body options(string $uri, ?array $data = null)
 */
final class ApiTestClient
{
    private App $app;

    private ?Request $request;

    private ?Response $response;

    public function __construct(App $app)
    {
        $this->app = $app;
    }

    public function __call($method, $arguments): Body
    {
        $methods = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options'];
        if (!in_array($method, $methods, true)) {
            throw new \BadMethodCallException(sprintf("The `%s` method is not supported.", strtoupper($method)));
        }
        return call_user_func_array([$this, 'request'], array_merge([$method], $arguments));
    }

    public function getResponseHttpCode(): ?int
    {
        if ($this->response === null) {
            return null;
        }
        return $this->response->getStatusCode();
    }

    public function getResponse(): ?Response
    {
        return $this->response;
    }

    public function getResponseAsString(): ?string
    {
        if ($this->response === null) {
            return null;
        }
        return (string) $this->response->getBody();
    }

    public function getResponseAsDecodedJson(): mixed
    {
        $rawResponse = $this->getResponseAsString();
        if ($rawResponse === null) {
            return null;
        }

        try {
            return json_decode($rawResponse, true);
        } catch (\JsonException) {
            return null;
        }
    }

    public function getResponseAsArray(): ?array
    {
        $response = $this->getResponseAsDecodedJson();

        return is_array($response) ? $response : null;
    }

    public function getResponseAsDotArray(): ?DotArray
    {
        return new DotArray($this->getResponseAsArray());
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    private function request(string $method, string $uri, ?array $data = null, mixed $files = null): Body
    {
        // - Reset des valeurs précédentes éventuelles.
        $this->request = null;
        $this->response = null;

        // - On réinitialise l'utilisateur avant la requête.
        if (Auth::user() !== null) {
            Auth::reset();
        }

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
