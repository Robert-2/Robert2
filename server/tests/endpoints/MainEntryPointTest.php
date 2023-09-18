<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class MainEntryPointTest extends ApiTestCase
{
    public function testMainEntryPoint(): void
    {
        $response = (string) $this->client->get('/');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotEmpty($response);

        $expectedFirstLine = '<!DOCTYPE html>';
        $firstLine = explode("\n", $response)[0];
        $this->assertEquals($expectedFirstLine, $firstLine);
    }
}
