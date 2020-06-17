<?php
namespace Robert2\Tests;

final class ErrorsTest extends ApiTestCase
{
    public function testRouteNotFound()
    {
        $this->client->get('/api/inexistant-resource');

        $this->assertStatusCode(ERROR_NOT_FOUND);
        $this->assertErrorMessage("The required resource was not found.");
    }

    public function testMethodNotAllowed()
    {
        $this->client->put('/not-a-get-route');

        $this->assertStatusCode(ERROR_NOT_ALLOWED);
        $this->assertErrorMessage("Method not allowed");
    }
}
