<?php
namespace Robert2\Tests;

final class MainEntryPointTest extends ApiTestCase
{
    public function testMainEntryPoint()
    {
        $this->client->get('/');
        $this->assertStatusCode(200);

        $response = (string)$this->client->response->getBody();
        $this->assertNotEmpty($response);

        $expectedFirstLine = '<!DOCTYPE html>';
        $firstLine = explode("\n", $response)[0];
        $this->assertEquals($expectedFirstLine, $firstLine);
    }
}
