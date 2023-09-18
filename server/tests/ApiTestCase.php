<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Adbar\Dot as DotArray;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\App;
use Loxya\Errors\Enums\ApiErrorCode;
use Loxya\Kernel;
use Loxya\Services\Auth;

class ApiTestCase extends TestCase
{
    protected App $app;

    protected ApiTestClient $client;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app = new App;
        $this->client = new ApiTestClient($this->app);

        // - Test specific configuration
        $this->app->add(new \Slim\HttpCache\Cache('private', 0));
    }

    protected function tearDown(): void
    {
        parent::tearDown();

        Auth::reset();
        Kernel::reset();
    }

    // ------------------------------------------------------
    // -
    // -    Assertion methods
    // -
    // ------------------------------------------------------

    public function assertStatusCode(int $expectedCode): void
    {
        $actualCode = $this->_getStatusCode();

        $serverErrorCode = StatusCode::STATUS_INTERNAL_SERVER_ERROR;
        if ($expectedCode !== $serverErrorCode && $actualCode === $serverErrorCode) {
            $response = $this->_getResponseAsArray();
            $message = sprintf(
                "%s, in %s\n",
                (
                    $response['error']['debug']['message']
                        ?? $response['error']['message']
                        ?? 'Unknown error'
                ),
                $response['error']['debug']['file'] ?? 'Unknown'
            );
            throw new \Exception($message, (int) $response['error']['code']);
        }

        $this->assertEquals($expectedCode, $actualCode);
    }

    public function assertApiError($code, ?string $message = null): void
    {
        $result = $this->_getResponseAsArray();

        foreach (['success', 'error'] as $key) {
            $this->assertArrayHasKey($key, $result, sprintf(
                "The expected error payload is missing. Actual output:\n%s",
                json_encode($result, JSON_PRETTY_PRINT)
            ));
        }

        $this->assertFalse($result['success']);
        $this->assertApiErrorCode($code);
        if ($message !== null) {
            $this->assertApiErrorMessage($message);
        }
    }

    public function assertApiErrorCode($code): void
    {
        $result = $this->_getResponseAsArray();

        if (!isset($result['error']['code'])) {
            $this->fail(sprintf(
                "The expected error code is missing. Actual output:\n%s",
                json_encode($result, JSON_PRETTY_PRINT)
            ));
        }

        $resultCode = $result['error']['code'];
        $this->assertSame(
            $code,
            $resultCode,
            // phpcs:ignore Generic.Files.LineLength
            sprintf("The API error code does not match the expected one (got %s instead of %s).\n", $resultCode, $code) .
            sprintf("Full output:\n%s", json_encode($result, JSON_PRETTY_PRINT))
        );
    }

    public function assertApiErrorMessage(string $message): void
    {
        $result = $this->_getResponseAsArray();

        if (!isset($result['error']['message'])) {
            $this->fail(sprintf(
                "The expected error message is missing. Actual output:\n%s",
                json_encode($result, JSON_PRETTY_PRINT)
            ));
        }

        $resultMessage = $result['error']['message'];
        $this->assertSame(
            $message,
            $resultMessage,
            sprintf(
                "The API error message does not match the expected one (got \"%s\" instead of \"%s\").\n",
                is_string($resultMessage) ? $resultMessage : var_export($resultMessage, true),
                $message
            ) .
            sprintf("Full output:\n%s", json_encode($result, JSON_PRETTY_PRINT))
        );
    }

    public function assertApiValidationError($details = null): void
    {
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorCode(ApiErrorCode::VALIDATION_FAILED);

        if ($details !== null) {
            $result = $this->_getResponseAsArray();
            $this->assertSameCanonicalize($details, $result['error']['details']);
        }
    }

    public function assertResponseData(array $expectedData): void
    {
        $response = $this->_getResponseAsArray();
        $this->assertSameCanonicalize($expectedData, $response);
    }

    public function assertResponseHasKey(string $path): void
    {
        $response = new DotArray($this->_getResponseAsArray());

        $this->assertTrue($response->has($path), sprintf("La clé \"%s\" n'existe pas dans la réponse.", $path));
    }

    public function assertResponseHasNotKey(string $path): void
    {
        $response = new DotArray($this->_getResponseAsArray());

        $this->assertFalse($response->has($path), sprintf("La clé \"%s\" existe dans la réponse.", $path));
    }

    public function assertResponseHasKeyEquals(string $path, $expectedValue): void
    {
        $response = new DotArray($this->_getResponseAsArray());

        $this->assertTrue($response->has($path), sprintf("La clé \"%s\" n'existe pas dans la réponse.", $path));
        $this->assertSameCanonicalize($expectedValue, $response->get($path));
    }

    public function assertResponseHasKeyNotEquals(string $path, $expectedValue): void
    {
        $response = new DotArray($this->_getResponseAsArray());

        $this->assertTrue($response->has($path), sprintf("La clé \"%s\" n'existe pas dans la réponse.", $path));
        $this->assertNotSameCanonicalize($expectedValue, $response->get($path));
    }

    public function assertResponsePaginatedData(int $totalCount, $expectedData = null): void
    {
        $response = new DotArray($this->_getResponseAsArray());

        $this->assertTrue(
            $response->has(['pagination', 'data']),
            "La réponse ne semble pas être une réponse avec pagination."
        );

        $data = $response->get('data');

        // - Vérifie les données de pagination.
        $this->assertSame($totalCount, $response->get('pagination.total.items'));

        // - Vérifie les données paginées (optionnel).
        if ($expectedData !== null) {
            $this->assertSameCanonicalize($expectedData, $data);
        }
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected function _getStatusCode(): ?int
    {
        if (empty($this->client->response)) {
            return null;
        }
        return $this->client->response->getStatusCode();
    }

    protected function _getResponseAsArray(): ?array
    {
        $response = (string) $this->client->response->getBody();

        return json_decode($response, true);
    }

    protected static function _dataFactory($id, array $data)
    {
        $data = array_column($data, null, 'id');
        return $id ? $data[$id] : array_values($data);
    }
}
