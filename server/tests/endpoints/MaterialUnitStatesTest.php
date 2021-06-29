<?php
namespace Robert2\Tests;

final class MaterialUnitStatesTest extends ApiTestCase
{
    public function testGetAll()
    {
        $this->client->get('/api/unit-states');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            [
                'name' => 'state-of-use',
                'order' => 1,
            ],
            [
                'name' => 'excellent',
                'order' => 2,
            ],
            [
                'name' => 'brand-new',
                'order' => 3,
            ],
            [
                'name' => 'bad',
                'order' => 4,
            ],
            [
                'name' => 'outdated',
                'order' => 5,
            ],
        ]);
    }
}
