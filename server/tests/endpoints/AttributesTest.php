<?php
namespace Robert2\Tests;

final class AttributesTest extends ApiTestCase
{
    public function testCreateAttribute()
    {
        $data = [
            'name'       => 'Speed',
            'type'       => 'float',
            'unit'       => 'km/h',
            'max_length' => 4,
        ];
        $this->client->post('/api/attributes', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $expected = [
            'id'         => 5,
            'name'       => 'Speed',
            'type'       => 'float',
            'unit'       => 'km/h',
            'max_length' => 4,
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
        ];
        $this->assertResponseData($expected, ['created_at', 'updated_at']);
    }
}
