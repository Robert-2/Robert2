<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Models\Role;

final class RolesTest extends ApiTestCase
{
    public static function data(?int $id = null)
    {
        return static::dataFactory($id, [
            [
                'id' => 1,
                'name' => "Régisseur",
                'is_used' => true,
            ],
            [
                'id' => 2,
                'name' => "Technicien plateau",
                'is_used' => true,
            ],
            [
                'id' => 3,
                'name' => "Ingénieur du son",
                'is_used' => true,
            ],
            [
                'id' => 4,
                'name' => "Installateur",
                'is_used' => false,
            ],
            [
                'id' => 5,
                'name' => "Intervenant extérieur",
                'is_used' => false,
            ],
        ]);
    }

    public function testGetAll(): void
    {
        $this->client->get('/api/roles');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(3),
            self::data(4),
            self::data(5),
            self::data(1),
            self::data(2),
        ]);
    }

    public function testCreate(): void
    {
        $this->client->post('/api/roles', ['name' => "Test"]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 6,
            'name' => "Test",
            'is_used' => false,
        ]);
    }

    public function testUpdate(): void
    {
        $this->client->put('/api/roles/2', ['name' => "Régisseur général"]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'id' => 2,
            'name' => "Régisseur général",
            'is_used' => true,
        ]);
    }

    public function testDelete(): void
    {
        // - Test avec un rôle qui est assigné à un technicien : suppression interdite.
        $this->client->delete('/api/roles/3');
        $this->assertStatusCode(StatusCode::STATUS_CONFLICT);
        $this->assertApiErrorMessage("This role cannot be deleted because it is in use.");

        // - Test avec un nouveau rôle (donc non utilisé : suppression OK).
        Role::create(['name' => "Test"]);
        $this->client->delete('/api/roles/4');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
    }
}
