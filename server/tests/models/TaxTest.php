<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\Tax;
use Loxya\Support\Arr;

final class TaxTest extends TestCase
{
    public function testValidation(): void
    {
        $generateTax = static function (array $data = []): Tax {
            $data = Arr::defaults($data, [
                'name' => "Taxe",
                'is_group' => false,
                'is_rate' => true,
                'value' => '10.255',
            ]);
            return new Tax($data);
        };

        // - Avec des données valides.
        $this->assertTrue($generateTax()->isValid());

        // - Avec des erreurs simples (1).
        $tax = $generateTax([
            'name' => '',
            'is_group' => 'ok',
            'is_rate' => 'nok',
            'value' => '__invalid__',
        ]);
        $expectedErrors = [
            'name' => "Ce champ est obligatoire.",
            'is_group' => "Ce champ doit être un booléen.",
            'is_rate' => "Ce champ doit être un booléen.",
            'value' => "Ce champ doit contenir un chiffre à virgule.",
        ];
        $this->assertFalse($tax->isValid());
        $this->assertSame($expectedErrors, $tax->validationErrors());

        // - Avec des erreurs simples (2).
        $tax = $generateTax([
            'name' => 'invalideeeeeeeeeeeeeeeeeeeeeeee',
            'is_group' => true,
            'is_rate' => true, // => Devrait être `null` vu que c'est un groupe.
            'value' => '100', // => Devrait être `null` vu que c'est un groupe.
        ]);
        $expectedErrors = [
            'name' => "1 caractères min., 30 caractères max.",
            'is_rate' => "Ce champ ne devrait pas être spécifié.",
            'value' => "Ce champ ne devrait pas être spécifié.",
        ];
        $this->assertFalse($tax->isValid());
        $this->assertSame($expectedErrors, $tax->validationErrors());

        // - Avec un nom déjà utilisé (avec un groupe: Vérification simple).
        $tax = $generateTax([
            'name' => "Taxe Québec (TPS + TVQ)",
            'is_group' => true,
            'is_rate' => null,
            'value' => null,
        ]);
        $expectedErrors = [
            'name' => "Une taxe avec ce nom existe déjà.",
        ];
        $this->assertFalse($tax->isValid());
        $this->assertSame($expectedErrors, $tax->validationErrors());

        // - Avec un nom déjà utilisé (sans groupe, erreur si même valeur).
        $tax = $generateTax(['name' => "T.V.A.", 'value' => '20']);
        $expectedErrors = [
            'name' => "Une taxe avec ce nom existe déjà.",
        ];
        $this->assertFalse($tax->isValid());
        $this->assertSame($expectedErrors, $tax->validationErrors());

        // - Avec un nom déjà utilisé (sans groupe, pas d'erreur si valeur différente).
        $tax = $generateTax(['name' => "T.V.A.", 'value' => '25']);
        $this->assertTrue($tax->isValid());

        // - Avec un taux et une valeur supérieure à 100%.
        $tax = $generateTax(['value' => '105']);
        $expectedErrors = [
            'value' => "Ce champ est invalide.",
        ];
        $this->assertFalse($tax->isValid());
        $this->assertSame($expectedErrors, $tax->validationErrors());

        // - Avec une valeur fixe et une valeur supérieure à 100: Valide.
        $tax = $generateTax(['is_rate' => false, 'value' => '105']);
        $this->assertTrue($tax->isValid());
    }

    public function testDelete(): void
    {
        // - Ne peut pas être supprimée si c'est la taxe par défaut.
        $this->assertThrow(\LogicException::class, static function () {
            Tax::findOrFail(1)->delete();
        });

        // - Ne peut pas être supprimée si utilisée.
        $this->assertThrow(\LogicException::class, static function () {
            Tax::findOrFail(2)->delete();
        });

        // - Test valide.
        $isDeleted = Tax::findOrFail(5)->delete();
        $this->assertTrue($isDeleted);
        $this->assertFalse(Tax::includes(5));
    }
}
