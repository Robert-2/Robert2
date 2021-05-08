<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models;

final class ParkTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Park();
    }

    public function testTableName(): void
    {
        $this->assertEquals('parks', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(2, $result);
    }

    public function testGetAllForUser(): void
    {
        // - Récupère la liste des parks visibles par l'utilisateur #1
        $result = $this->model->getAllForUser(1)->get()->toArray();
        $this->assertCount(2, $result);
        $this->assertEquals(1, $result[0]['id']);
        $this->assertEquals(2, $result[1]['id']);

        // - Récupère la liste des parks visibles par l'utilisateur #2
        $result = $this->model->getAllForUser(2)->get()->toArray();
        $this->assertCount(1, $result);
        $this->assertEquals(1, $result[0]['id']);

        // - Récupère la liste des parks visibles par l'utilisateur #3
        $result = $this->model->getAllForUser(3)->get()->toArray();
        $this->assertCount(1, $result);
        $this->assertEquals(1, $result[0]['id']);
    }

    public function testGetMaterials(): void
    {
        $Park = $this->model::find(1);
        $results = $Park->materials;
        $this->assertCount(5, $results);
    }

    public function testGetTotalItems(): void
    {
        $Park = $this->model::find(1);
        $this->assertEquals(7, $Park->total_items);
    }

    public function testGetTotalAmount(): void
    {
        $Park = $this->model::find(1);
        $this->assertEquals(119061.80, $Park->total_amount);
    }

    public function testGetPerson(): void
    {
        $Park = $this->model::find(1);
        $this->assertEquals([
            'id' => 1,
            'user_id' => 1,
            'first_name' => 'Jean',
            'last_name' => 'Fountain',
            'full_name' => 'Jean Fountain',
            'reference' => '0001',
            'nickname' => null,
            'email' => 'tester@robertmanager.net',
            'phone' => null,
            'street' => '1, somewhere av.',
            'postal_code' => '1234',
            'locality' => 'Megacity',
            'country_id' => 1,
            'company_id' => 1,
            'note' => null,
            'created_at' => null,
            'updated_at' => null,
            'deleted_at' => null,
            'company' => [
                'id' => 1,
                'legal_name' => 'Testing, Inc',
                'street' => '1, company st.',
                'postal_code' => '1234',
                'locality' => 'Megacity',
                'country_id' => 1,
                'phone' => '+4123456789',
                'note' => 'Just for tests',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'country' => [
                    'id' => 1,
                    'name' => 'France',
                    'code' => 'FR',
                ],
            ],
            'country' => [
                'id' => 1,
                'name' => 'France',
                'code' => 'FR',
            ],
        ], $Park->person);
    }

    public function testGetCompany(): void
    {
        $Park = $this->model::find(2);
        $this->assertEquals([
            'id' => 1,
            'legal_name' => 'Testing, Inc',
            'street' => '1, company st.',
            'postal_code' => '1234',
            'locality' => 'Megacity',
            'country_id' => 1,
            'phone' => '+4123456789',
            'note' => 'Just for tests',
            'created_at' => null,
            'updated_at' => null,
            'deleted_at' => null,
            'country' => [
                'id' => 1,
                'name' => 'France',
                'code' => 'FR',
            ],
        ], $Park->company);
    }

    public function testGetCountry(): void
    {
        $Park = $this->model::find(1);
        $this->assertEquals([
            'id' => 1,
            'name' => 'France',
            'code' => 'FR',
        ], $Park->country);
    }

    public function testGetUsers(): void
    {
        // - Récupère les utilisateurs qui n'ont pas accès au park #1
        $Park = $this->model::find(1);
        $results = $Park->users;
        $this->assertEquals([], $results);

        // - Récupère les utilisateurs qui n'ont pas accès au park #2
        $Park = $this->model::find(2);
        $results = $Park->users;
        $this->assertEquals(3, $results[0]['id']);
        $this->assertEquals(2, $results[1]['id']);
    }
}
