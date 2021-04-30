<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\App;
use PHPUnit\Framework\TestCase;

class ApiTestCase extends TestCase
{
    use SettingsTrait {
        setUp as baseSetUp;
    }

    /** @var App */
    protected $app;

    /** @var ApiTestClient */
    protected $client;

    protected function setUp(): void
    {
        $this->baseSetUp();

        $this->app = (new App)->add(new \Slim\HttpCache\Cache('private', 0));
        $this->client = new ApiTestClient($this->app);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Assertion methods
    // —
    // ——————————————————————————————————————————————————————

    public function assertStatusCode(int $expectedCode): void
    {
        $actualCode = $this->_getStatusCode();

        if ($expectedCode !== 500 && $actualCode === 500) {
            $response = $this->_getResponseAsArray();
            $message  = sprintf(
                "%s, in %s\n",
                $response['error']['message'],
                $response['error']['file']
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

    public function assertNotFoundErrorMessage(): void
    {
        $this->assertErrorMessage("The required resource was not found.");
    }

    public function assertValidationErrorMessage(): void
    {
        $this->assertErrorMessage(
            "Validation failed. See error[details] for more informations."
        );
    }

    public function assertErrorDetails(array $details): void
    {
        $result = $this->_getResponseAsArray();
        $this->assertEquals($details, $result['error']['details']);
    }

    public function assertResponseData(array $expectedData, array $fakeTestFields = []): void
    {
        $response = $this->_getResponseAsArray();

        foreach ($fakeTestFields as $field) {
            if (isset($response[$field])) {
                $response[$field] = 'fakedTestContent';
            }
        }

        $this->assertEquals($expectedData, $response);
    }

    public function assertResponsePaginatedData(int $count, string $baseUrl, string $extraParams = ''): void
    {
        $response    = $this->_getResponseAsArray();
        $extraParams = !empty($extraParams) ? $extraParams . '&' : '';

        $this->assertEquals([
            'current_page'   => 1,
            'first_page_url' => "$baseUrl?" . $extraParams . "page=1",
            'from'           => $count ? 1 : null,
            'last_page'      => 1,
            'last_page_url'  => "$baseUrl?" . $extraParams . "page=1",
            'next_page_url'  => null,
            'path'           => $baseUrl,
            'per_page'       => 100,
            'prev_page_url'  => null,
            'to'             => $count ?: null,
            'total'          => $count,
        ], @$response['pagination']);

        $this->assertCount($count, @$response['data']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Protected methods
    // —
    // ——————————————————————————————————————————————————————

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
}
