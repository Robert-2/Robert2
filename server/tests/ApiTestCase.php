<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Adbar\Dot as DotArray;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\App;
use Robert2\API\Kernel;

class ApiTestCase extends TestCase
{
    /** @var App */
    protected $app;

    /** @var ApiTestClient */
    protected $client;

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
                $response['error']['message'],
                $response['error']['debug']['file']
            );
            throw new \Exception($message, (int)$response['error']['code']);
        }

        $this->assertEquals($expectedCode, $this->_getStatusCode());
    }

    public function assertErrorMessage(string $message): void
    {
        $result = $this->_getResponseAsArray();
        if (!isset($result['error']['message'])) {
            $this->fail(sprintf(
                "No expected error message. Actual output:\n%s",
                json_encode($result, JSON_PRETTY_PRINT)
            ));
        }
        $this->assertEquals($message, $result['error']['message']);
    }

    public function assertNotFound(): void
    {
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
        $this->assertErrorMessage("Not found.");
    }

    public function assertValidationError($details = null): void
    {
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertErrorMessage("Validation failed. See error[details] for more informations.");

        if ($details !== null) {
            $result = $this->_getResponseAsArray();
            $this->assertEquals($details, $result['error']['details']);
        }
    }

    public function assertResponseData(array $expectedData, array $fakeTestFields = []): void
    {
        $response = $this->_getResponseAsArray();

        foreach ($fakeTestFields as $field) {
            if (isset($response[$field])) {
                $response[$field] = '__FAKE_TEST_PLACEHOLDER__';
            }
        }

        $this->assertEquals($expectedData, $response);
    }

    public function assertResponseHasKeyEquals(string $path, $expectedValue): void
    {
        $response = new DotArray($this->_getResponseAsArray());

        $this->assertTrue($response->has($path), sprintf("La clé \"%s\" n'existe pas dans la réponse.", $path));
        $this->assertEquals($expectedValue, $response->get($path));
    }

    public function assertResponseHasKeyNotEquals(string $path, $expectedValue): void
    {
        $response = new DotArray($this->_getResponseAsArray());

        $this->assertTrue($response->has($path), sprintf("La clé \"%s\" n'existe pas dans la réponse.", $path));
        $this->assertNotEquals($expectedValue, $response->get($path));
    }

    public function assertResponsePaginatedData(int $totalCount, $expectedData = null, array $fakeTestFields = []): void
    {
        $response = new DotArray($this->_getResponseAsArray());

        $this->assertTrue(
            $response->has(['pagination', 'data']),
            "La réponse ne semble pas être une réponse avec pagination."
        );

        $data = $response->get('data');

        // - Vérifie les données de pagination.
        $this->assertEquals($totalCount, $response->get('pagination.total.items'));

        // - Vérifie les données paginées (optionnel).
        if ($expectedData !== null) {
            foreach ($fakeTestFields as $field) {
                if (isset($$data[$field])) {
                    $data[$field] = '__FAKE_TEST_PLACEHOLDER__';
                }
            }
            $this->assertEquals($expectedData, $data);
        }
    }

    // ------------------------------------------------------
    // -
    // -    Protected methods
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
        $response = (string)$this->client->response->getBody();

        return json_decode($response, true);
    }

    protected static function _dataFactory($id, array $data)
    {
        $data = array_column($data, null, 'id');
        return $id ? $data[$id] : array_values($data);
    }
}
