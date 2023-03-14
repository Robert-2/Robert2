<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class MainEntryPointTest extends ApiTestCase
{
    public function testMainEntryPoint()
    {
        $response = (string) $this->client->get('/');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotEmpty($response);

        $expectedFirstLine = '<!DOCTYPE html>';
        $firstLine = explode("\n", $response)[0];
        $this->assertEquals($expectedFirstLine, $firstLine);
    }
}
