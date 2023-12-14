<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class ErrorsTest extends ApiTestCase
{
    public function testRouteNotFound(): void
    {
        $this->client->get('/api/inexistant-resource');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testMethodNotAllowed(): void
    {
        $this->client->put('/not-a-get-route');

        $this->assertStatusCode(StatusCode::STATUS_METHOD_NOT_ALLOWED);
        $this->assertApiErrorMessage("Method not allowed. Must be one of: GET");
    }
}
