<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models;
use Robert2\API\Errors;

final class TagTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Tag();
    }

    public function testTableName(): void
    {
        $this->assertEquals('tags', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertEquals([
            [
                'id' => 2,
                'name' => 'Beneficiary',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 3,
                'name' => 'pro',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 1,
                'name' => 'Technician',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
        ], $result);
    }

    public function testGetPersons(): void
    {
        $Tag    = $this->model::find(2);
        $result = $Tag->persons;
        $this->assertEquals([
            [
                'id' => 2,
                'user_id' => 2,
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
                'nickname' => 'Riri',
                'reference' => '0002',
                'email' => 'tester2@robertmanager.net',
                'phone' => null,
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => null,
                'company_id' => null,
                'note' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'full_name' => 'Roger Rabbit',
                'company' => null,
                'country' => null,
                'pivot' => [
                    'tag_id' => 2,
                    'taggable_id' => 2,
                    'taggable_type' => 'Robert2\API\Models\Person',
                ],
            ],
        ], $result);
    }

    public function testGetMaterials(): void
    {
        $Tag = $this->model::find(3);
        $results = $Tag->materials;
        $this->assertCount(3, $results);
    }

    public function testGetIdsByNames(): void
    {
        $result = $this->model->getIdsByNames(['Technician']);
        $this->assertEquals([1], $result);
    }

    public function testBulkAdd(): void
    {
        $this->assertEmpty($this->model->bulkAdd([]));

        // - Ajout de deux tags d'un seul coup
        $result = $this->model->bulkAdd(['newone', 'nextNewone']);
        $this->assertEquals('newone', @$result[0]['name']);
        $this->assertEquals('nextNewone', @$result[1]['name']);

        // - Ajout de tags avec un qui existait déjà (ne l'ajoute pas deux fois)
        $result = $this->model->bulkAdd(['super tag', 'Technician']);
        $this->assertEquals('super tag', @$result[0]['name']);
        $this->assertEquals('Technician', @$result[1]['name']);
        $this->assertEquals(1, @$result[1]['id']);
    }

    public function testFormat(): void
    {
        $Tags   = Models\Tag::where('name', 'like', '%ci%')->get();
        $result = Models\Tag::format($Tags);
        $this->assertEquals([
            ['id' => 1, 'name' => 'Technician'],
            ['id' => 2, 'name' => 'Beneficiary'],
        ], $result);
    }
}
