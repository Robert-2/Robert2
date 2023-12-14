<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\Attribute;

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
            'type' => 'date',
            'unit' => 'kg',
            'max_length' => 100,
            'is_totalisable' => false,
        ];
        $testValidation($testData, [
            'unit' => ['Ce champ ne devrait pas être spécifié.'],
            'max_length' => ['Ce champ ne devrait pas être spécifié.'],
            'is_totalisable' => ['Ce champ ne devrait pas être spécifié.'],
        ]);

        // - Si `max_length`, `unit` et `is_totalisable` sont à `null` pour les
        //   attributs autres (cf. commentaire au dessus) => Pas d'erreur.
        $testData = array_replace($testData, array_fill_keys(['unit', 'max_length', 'is_totalisable'], null));
        (new Attribute($testData))->validate();

        // - Test `max_length`: Vérification "normale" si attribut de type `string`.
        $testData = [
            'id' => 6,
            'name' => 'Testing',
            'type' => 'string',
            'max_length' => 'NOT_A_NUMBER',
        ];
        $testValidation($testData, [
            'max_length' => ['Ce champ ne peut contenir que des nombres.'],
        ]);

        // - Test `max_length`: Si valide pour les attributs de type `string` => Pas d'erreur.
        $testData = array_replace($testData, ['max_length' => 100]);
        (new Attribute($testData))->validate();

        // - Test `unit`: Vérification "normale" si attribut de type `float` ou `integer`.
        $baseTestData = [
            'id' => 6,
            'name' => 'Testing',
            'unit' => 'TROP_LOOOOOOOOOOOOOONG',
            'is_totalisable' => true,
        ];
        foreach (['float', 'integer'] as $type) {
            $testData = array_replace($baseTestData, compact('type'));
            $testValidation($testData, [
                'unit' => ['1 caractères min., 8 caractères max.'],
            ]);
        }

        // - Test `unit`: si valide pour les attributs de type `float` ou `integer` => Pas d'erreur.
        foreach (['float', 'integer'] as $type) {
            $testData = array_replace($baseTestData, compact('type'), ['unit' => 'kg']);
            (new Attribute($testData))->validate();
        }

        // - Test `is_totalisable`: Vérification "normale" si attribut de type `float` ou `integer`.
        $baseTestData = [
            'id' => 6,
            'name' => 'Testing',
            'unit' => 'cm',
            'is_totalisable' => 'not-a-boolean',
        ];
        foreach (['float', 'integer'] as $type) {
            $testData = array_replace($baseTestData, compact('type'));
            $testValidation($testData, [
                'is_totalisable' => ['Ce champ doit être un booléen.'],
            ]);
        }

        // - Test `is_totalisable`: si valide pour les attributs de type `float` ou `integer` => Pas d'erreur.
        foreach (['float', 'integer'] as $type) {
            $testData = array_replace($baseTestData, compact('type'), ['is_totalisable' => true]);
            (new Attribute($testData))->validate();
        }
    }

    public function testEdit(): void
    {
        // - Crée une caractéristique spéciale
        $result = Attribute::new(['name' => 'Testing', 'type' => 'date']);
        $expected = [
            'id' => 6,
            'name' => 'Testing',
            'type' => 'date',
            'unit' => null,
            'max_length' => null,
            'is_totalisable' => false,
        ];
        unset($result->created_at, $result->updated_at, $result->deleted_at);
        $this->assertEquals($expected, $result->toArray());

        // - Modifie une caractéristique spéciale
        $result = Attribute::staticEdit(1, [
            'name' => 'Masse',
            'type' => 'integer',
            'unit' => 'g',
            'categories' => [3, 4],
            'is_totalisable' => false,
        ]);
        // - Le type ne doit pas avoir changé
        $this->assertNotEquals('integer', $result->type);
        // - Mais tout le reste doit avoir été mis à jour
        $this->assertEquals('Masse', $result->name);
        $this->assertEquals('g', $result->unit);
        $this->assertFalse($result->is_totalisable);
        $this->assertEquals([4, 3], $result->categories->map(fn ($category) => $category->id)->toArray());
    }
}
