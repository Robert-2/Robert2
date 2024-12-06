<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Illuminate\Support\Carbon;
use Loxya\Models\Attribute;
use Loxya\Models\Enums\AttributeEntity;
use Loxya\Models\Enums\AttributeType;

final class AttributeTest extends TestCase
{
    public function testValidation(): void
    {
        $testValidation = function (array $testData, array $expectedErrors): void {
            $this->assertSame($expectedErrors, (new Attribute($testData))->validationErrors());
        };

        // - Test `max_length`: Doit être à `null` si attribut autre que type `string`.
        // - Test `unit`: Doit être à `null` si attribut autre que type `float` ou `integer`.
        // - Test `is_totalisable`: Doit être à `null` si attribut autre que type `float` ou `integer`.
        $testData = [
            'id' => 6,
            'name' => 'Testing',
            'entities' => [
                AttributeEntity::MATERIAL->value,
            ],
            'type' => AttributeType::DATE->value,
            'unit' => 'kg',
            'max_length' => 100,
            'is_totalisable' => false,
        ];
        $testValidation($testData, [
            'unit' => "Ce champ ne devrait pas être spécifié.",
            'max_length' => "Ce champ ne devrait pas être spécifié.",
            'is_totalisable' => "Ce champ ne devrait pas être spécifié.",
        ]);

        // - Si `max_length`, `unit` et `is_totalisable` sont à `null` pour les
        //   attributs autres (cf. commentaire au dessus) => Pas d'erreur.
        $testData = array_replace($testData, array_fill_keys(['unit', 'max_length', 'is_totalisable'], null));
        (new Attribute($testData))->validate();

        // - Test `max_length`: Vérification "normale" si attribut de type `string`.
        $testData = [
            'id' => 6,
            'name' => 'Testing',
            'entities' => [AttributeEntity::MATERIAL->value],
            'type' => AttributeType::STRING->value,
            'max_length' => 'NOT_A_NUMBER',
        ];
        $testValidation($testData, [
            'max_length' => "Ce champ doit contenir un nombre entier.",
        ]);

        // - Test `max_length`: Si valide pour les attributs de type `string` => Pas d'erreur.
        $testData = array_replace($testData, ['max_length' => 100]);
        (new Attribute($testData))->validate();

        // - Test `unit`: Vérification "normale" si attribut de type `float` ou `integer`.
        $baseTestData = [
            'id' => 6,
            'name' => 'Testing',
            'entities' => [AttributeEntity::MATERIAL->value],
            'unit' => 'TROP_LOOOOOOOOOOOOOONG',
            'is_totalisable' => true,
        ];
        $numericTypes = [
            AttributeType::INTEGER->value,
            AttributeType::FLOAT->value,
        ];
        foreach ($numericTypes as $type) {
            $testData = array_replace($baseTestData, compact('type'));
            $testValidation($testData, [
                'unit' => "1 caractères min., 8 caractères max.",
            ]);
        }

        // - Test `unit`: si valide pour les attributs de type `float` ou `integer` => Pas d'erreur.
        foreach ($numericTypes as $type) {
            $testData = array_replace($baseTestData, compact('type'), ['unit' => 'kg']);
            (new Attribute($testData))->validate();
        }

        // - Test `is_totalisable`: Vérification "normale" si attribut de type `float` ou `integer`.
        $baseTestData = [
            'id' => 6,
            'name' => 'Testing',
            'entities' => [AttributeEntity::MATERIAL->value],
            'unit' => 'cm',
            'is_totalisable' => 'not-a-boolean',
        ];
        foreach ($numericTypes as $type) {
            $testData = array_replace($baseTestData, compact('type'));
            $testValidation($testData, [
                'is_totalisable' => "Ce champ doit être un booléen.",
            ]);
        }

        // - Test `is_totalisable`: si valide pour les attributs de type `float` ou `integer` => Pas d'erreur.
        foreach ($numericTypes as $type) {
            $testData = array_replace($baseTestData, compact('type'), ['is_totalisable' => true]);
            (new Attribute($testData))->validate();
        }

        // - Tests `entities`: doit être un sous-ensemble des valeurs possibles.
        $baseTestData = [
            'id' => 6,
            'name' => 'Testing',
            'type' => AttributeType::STRING->value,
        ];
        $invalidSets = [
            '',
            [],
            null,
            ['not-recognized'],
            ['material', 'not-recognized'],
            ['material', 'material-unit', 'not-recognized'],
        ];
        foreach ($invalidSets as $invalidSet) {
            $testData = array_replace($baseTestData, ['entities' => $invalidSet]);
            $testValidation($testData, [
                'entities' => "Ce champ est invalide.",
            ]);
        }

        // - Test avec des valeurs et sous-ensembles valides.
        $validValues = [
            [AttributeEntity::MATERIAL->value],
        ];
        foreach ($validValues as $validValue) {
            $testData = array_replace($baseTestData, ['entities' => $validValue]);
            (new Attribute($testData))->validationErrors();
        }
    }

    public function testNew(): void
    {
        Carbon::setTestNow(Carbon::create(2024, 11, 20, 13, 30, 0));

        // - Crée une caractéristique spéciale
        $result = Attribute::new([
            'name' => 'Testing',
            'entities' => [AttributeEntity::MATERIAL->value],
            'type' => AttributeType::DATE->value,
        ]);
        $expected = [
            'id' => 9,
            'name' => 'Testing',
            'entities' => [AttributeEntity::MATERIAL->value],
            'type' => AttributeType::DATE->value,
            'unit' => null,
            'max_length' => null,
            'is_totalisable' => null,
            'created_at' => '2024-11-20 13:30:00',
            'updated_at' => '2024-11-20 13:30:00',
        ];
        $this->assertEquals($expected, $result->toArray());
    }

    public function testEdit(): void
    {
        // - Modifie une caractéristique spéciale
        $result = Attribute::findOrFail(1)->edit([
            'name' => 'Masse',
            'entities' => [
                AttributeEntity::MATERIAL->value,
            ],
            'type' => AttributeType::INTEGER->value,
            'unit' => 'g',
            'categories' => [3, 4],
            'is_totalisable' => false,
        ]);

        // - Le type ne doit pas avoir changé
        $this->assertNotEquals(AttributeType::INTEGER->value, $result->type);

        // - Mais tout le reste doit avoir été mis à jour
        $this->assertSame(
            [
                AttributeEntity::MATERIAL->value,
            ],
            $result->entities,
        );
        $this->assertEquals('Masse', $result->name);
        $this->assertEquals('g', $result->unit);
        $this->assertFalse($result->is_totalisable);
        $this->assertEquals([4, 3], (
            $result->categories
                ->map(static fn ($category) => $category->id)
                ->toArray()
        ));
    }
}
