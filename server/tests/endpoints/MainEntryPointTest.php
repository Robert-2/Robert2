<?php
namespace Robert2\Tests;

final class MainEntryPointTest extends ApiTestCase
{
    public function testMainEntryPoint()
    {
        $response = (string)$this->client->get('/');
        $this->assertStatusCode(200);
        $this->assertNotEmpty($response);

        $expectedFirstLine = '<!DOCTYPE html>';
        $firstLine = explode("\n", $response)[0];
        $this->assertEquals($expectedFirstLine, $firstLine);
    }
}
