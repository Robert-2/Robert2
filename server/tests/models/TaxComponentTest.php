<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\TaxComponent;
use Loxya\Support\Arr;

final class TaxComponentTest extends TestCase
{
    public function testValidation(): void
    {
        $generateTaxComponent = static fn (array $data = []) => (
            tap(new TaxComponent(), static function (TaxComponent $component) use ($data) {
                $component->tax_id = $data['tax_id'] ?? 4;
                $component->fill(Arr::defaults($data, [
                    'name' => "Taxe écologique",
                    'is_rate' => false,
                    'value' => '1.00',
                ]));
            })
        );

        // - Avec des données valides.
        $this->assertTrue($generateTaxComponent()->isValid());

        // - Avec des erreurs simples.
        $taxComponent = $generateTaxComponent([
            'name' => 'invalideeeeeeeeeeeeeeeeeeeeeeee',
            'is_rate' => 'nok',
            'value' => '__invalid__',
        ]);
        $expectedErrors = [
            'name' => "1 caractères min., 30 caractères max.",
            'is_rate' => "Ce champ doit être un booléen.",
            'value' => "Ce champ doit contenir un chiffre à virgule.",
        ];
        $this->assertFalse($taxComponent->isValid());
        $this->assertSame($expectedErrors, $taxComponent->validationErrors());

        // - Avec un nom déjà utilisé.
        $taxComponent = $generateTaxComponent(['name' => "Éco-participation"]);
        $expectedErrors = [
            'name' => "Cette composante de taxe existe déjà dans la même taxe.",
        ];
        $this->assertFalse($taxComponent->isValid());
        $this->assertSame($expectedErrors, $taxComponent->validationErrors());

        // - Avec un nom déjà utilisé dans une autre taxe : Pas d'erreur.
        $taxComponent = $generateTaxComponent([
            'tax_id' => 5,
            'name' => "Éco-participation",
        ]);
        $this->assertTrue($taxComponent->isValid());

        // - Avec un identifiant de taxe qui n'est pas un groupe.
        $taxComponent = $generateTaxComponent(['tax_id' => 1]);
        $expectedErrors = [
            'tax_id' => "Ce champ est invalide.",
        ];
        $this->assertFalse($taxComponent->isValid());
        $this->assertSame($expectedErrors, $taxComponent->validationErrors());

        // - Avec un taux et une valeur supérieure à 100%.
        $taxComponent = $generateTaxComponent(['is_rate' => true, 'value' => '105']);
        $expectedErrors = [
            'value' => "Ce champ est invalide.",
        ];
        $this->assertFalse($taxComponent->isValid());
        $this->assertSame($expectedErrors, $taxComponent->validationErrors());

        // - Avec une valeur fixe et une valeur supérieure à 100: Valide.
        $taxComponent = $generateTaxComponent(['value' => '105']);
        $this->assertTrue($taxComponent->isValid());
    }
}
