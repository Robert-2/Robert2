<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Models;

final class DocumentTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Document();
    }

    public function testTableName(): void
    {
        $this->assertEquals('documents', $this->model->getTable());
    }

    public function testGetMaterial()
    {
        $result = $this->model::find(1)->material;
        $expected = [
            'id' => 1,
            'name' => "Console Yamaha CL3",
            'reference' => "CL3",
            'units' => [],
            'tags' => [
                ['id' => 3, 'name' => 'pro'],
            ],
            'attributes' => [
                [
                    'id' => 3,
                    'name' => "Puissance",
                    'type' => "integer",
                    'unit' => "W",
                    'value' => 850,
                ],
                [
                    'id' =>2,
                    'name' => "Couleur",
                    'type' => "string",
                    'unit' => null,
                    'value' => "Grise",
                ],
                [
                    'id' => 1,
                    'name' => "Poids",
                    'type' => "float",
                    'unit' => "kg",
                    'value' => 36.5,
                ],
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetFilePathAttribute()
    {
        $document = $this->model::find(1);
        $this->assertEquals(
            DATA_FOLDER . DS . 'materials'. DS .'1'. DS .'User-manual.pdf',
            $document->file_path
        );
    }

    public function testRemoveNotExists()
    {
        $this->expectException(ModelNotFoundException::class);
        $this->model->remove(9999);
    }

    public function testRemove()
    {
        $document = $this->model::find(1);
        $filePath = $this->model::getFilePath($document->material_id, $document->name);

        copy($filePath, $filePath . '_backup.pdf');

        $this->model->remove($document->id);
        $this->assertNull($this->model->find($document->id));
        $this->assertFalse(file_exists($filePath));

        rename($filePath . '_backup.pdf', $filePath);
    }

    public function testGetFilePath()
    {
        $result = $this->model::getFilePath(1, 'file.pdf');
        $this->assertEquals(
            DATA_FOLDER . DS . 'materials' . DS . '1' . DS . 'file.pdf',
            $result
        );
    }
}
