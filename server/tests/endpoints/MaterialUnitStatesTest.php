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
                'id' => 'state-of-use',
                'name' => 'State of use',
                'order' => 1,
            ],
            [
                'id' => 'excellent',
                'name' => 'Excellent',
                'order' => 2,
            ],
            [
                'id' => 'brand-new',
                'name' => 'Brand new',
                'order' => 3,
            ],
            [
                'id' => 'bad',
                'name' => 'Bad',
                'order' => 4,
            ],
            [
                'id' => 'outdated',
                'name' => 'Outdated',
                'order' => 5,
            ],
        ]);
    }
}
