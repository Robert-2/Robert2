<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models\Attribute;
use Robert2\API\Errors\ValidationException;
use PHPUnit\Framework\Constraint\Exception as ExceptionConstraint;

final class AttributeTest extends TestCase
{
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
            'unit' => ['Must be null'],
            'max_length' => ['Must be null'],
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
            'max_length' => ['This field must contain only numbers'],
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
                'unit' => ['1 min. characters, 8 max. characters'],
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
        $result = Attribute::new(['name' => 'Testing', 'type' => 'date']);
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
        $result = Attribute::staticEdit(1, [
            'name' => 'Masse',
            'type' => 'integer',
            'unit' => 'g',
        ]);
        $this->assertEquals('Masse', $result->name);

        // - Seul ne nom doit pouvoir être changées après coup, pas les autres champs.
        //   (des valeurs existent peut-être déjà pour cet attribut pour ces contraintes)
        $this->assertNotEquals('integer', $result->type);
        $this->assertNotEquals('g', $result->unit);
    }
}
