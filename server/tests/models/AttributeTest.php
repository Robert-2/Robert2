<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models\Attribute;
use Robert2\API\Errors\ValidationException;
use PHPUnit\Framework\Constraint\Exception as ExceptionConstraint;

final class AttributeTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Attribute();
    }

    public function testTableName(): void
    {
        $this->assertEquals('attributes', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(5, $result);
        $this->assertEquals([
            [
                'id' => 1,
                'name' => "Poids",
                'type' => "float",
                'unit' => "kg",
                'max_length' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 2,
                'name' => "Couleur",
                'type' => "string",
                'unit' => null,
                'max_length' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 3,
                'name' => "Puissance",
                'type' => "integer",
                'unit' => "W",
                'max_length' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 4,
                'name' => "Conforme",
                'type' => "boolean",
                'unit' => null,
                'max_length' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 5,
                'name' => "Date d'achat",
                'type' => "date",
                'unit' => null,
                'max_length' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
        ], $result);
    }

    public function testGetMaterials(): void
    {
        $Event = Attribute::find(4);
        $results = $Event->materials;
        $expected = [
            [
                'id' => 4,
                'name' => 'Showtec SDS-6',
                'tags' => [],
                'attributes' => [
                    [
                        'id' => 4,
                        'name' => 'Conforme',
                        'type' => 'boolean',
                        'unit' => null,
                        'value' => true,
                    ],
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 60,
                    ],
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 3.15,
                    ],
                ],
                'pivot' => [
                    'attribute_id' => 4,
                    'material_id' => 4,
                    'value' => 'true',
                ],
            ],
        ];
        $this->assertEquals($expected, $results);
    }

    public function testValidation(): void
    {
        $testValidation = function (array $testData, array $expectedErrors) {
            $validationExConstraint = new ExceptionConstraint(ValidationException::class);
            try {
                (new Attribute($testData))->validate();
            } catch (\Throwable $exception) {
                /** @var ValidationException $exception */
                $this->assertThat($exception, $validationExConstraint);
                $this->assertSame($expectedErrors, $exception->getValidationErrors());
                return;
            }
            $this->assertThat(null, $validationExConstraint);
        };

        // - Test `max_length`: Doit être à `null` si attribut autre que type `string`.
        // - Test `unit`: Doit être à `null` si attribut autre que type `float` ou `integer`.
        $testData = [
            'id' => 6,
            'name' => 'Testing',
            'type' => 'date',
            'unit' => 'kg',
            'max_length' => 100,
        ];
        $testValidation($testData, [
            'unit' => ['unit must be null'],
            'max_length' => ['max_length must be null'],
        ]);

        // - Si `max_length` | `unit` à `null` pour les attributs autres (cf. commentaire au dessus) => Pas d'erreur.
        $testData = array_replace($testData, array_fill_keys(['unit', 'max_length'], null));
        (new Attribute($testData))->validate();

        // - Test `max_length`: Vérification "normale" si attribut de type `string`.
        $testData = [
            'id' => 6,
            'name' => 'Testing',
            'type' => 'string',
            'max_length' => 'NOT_A_NUMBER',
        ];
        $testValidation($testData, [
            'max_length' => ['max_length must be numeric'],
        ]);

        // - Test `max_length`: Si valide pour les attributs de type `string` => Pas d'erreur.
        $testData = array_replace($testData, ['max_length' => 100]);
        (new Attribute($testData))->validate();

        // - Test `unit`: Vérification "normale" si attribut de type `float` ou `integer`.
        $baseTestData = [
            'id' => 6,
            'name' => 'Testing',
            'unit' => 'TROP_LOOOOOOOOOOOOOONG',
        ];
        foreach (['float', 'integer'] as $type) {
            $testData = array_replace($baseTestData, compact('type'));
            $testValidation($testData, [
                'unit' => ['unit must have a length between 1 and 8'],
            ]);
        }

        // - Test `unit`: si valide pour les attributs de type `float` ou `integer` => Pas d'erreur.
        foreach (['float', 'integer'] as $type) {
            $testData = array_replace($baseTestData, compact('type'), ['unit' => 'kg']);
            (new Attribute($testData))->validate();
        }
    }

    public function testEdit(): void
    {
        // - Crée une caractéristique spéciale
        $result = $this->model->edit(null, ['name' => 'Testing', 'type' => 'date']);
        $expected = [
            'id' => 6,
            'name' => 'Testing',
            'type' => 'date',
            'unit' => null,
            'max_length' => null,
        ];
        unset($result->created_at, $result->updated_at, $result->deleted_at);
        $this->assertEquals($expected, $result->toArray());

        // - Modifie une caractéristique spéciale
        $result = $this->model->edit(1, [
            'name' => 'Masse',
            'type' => 'integer',
            'unit' => 'g',
        ]);
        $expected = [
            'id' => 1,
            'name' => 'Masse',
            'type' => 'integer',
            'unit' => 'g',
            'max_length' => null,
        ];
        unset($result->created_at, $result->updated_at, $result->deleted_at);
        $this->assertEquals($expected, $result->toArray());
    }

    public function testRemove(): void
    {
        // - Supprime une caractéristique spéciale
        $this->model->remove(3);
        // - Vérifie qu'elle a bien été supprimée
        $this->assertEmpty(Attribute::find(3));
    }
}
