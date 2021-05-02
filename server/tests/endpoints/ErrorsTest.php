<?php
namespace Robert2\Tests;

final class ErrorsTest extends ApiTestCase
{
    public function testRouteNotFound()
    {
        $this->client->get('/api/inexistant-resource');
        $this->assertNotFound();
    }

    public function testMethodNotAllowed()
    {
        $this->client->put('/not-a-get-route');

        $this->assertStatusCode(ERROR_NOT_ALLOWED);
        $this->assertErrorMessage("Method not allowed. Must be one of: GET");
    }
}
