<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\DegressiveRateTier;
use Loxya\Support\Arr;

final class DegressiveRateTierTest extends TestCase
{
    public function testValidation(): void
    {
        $generateTier = static fn (array $data = []) => (
            tap(new DegressiveRateTier(), static function (DegressiveRateTier $tier) use ($data) {
                $tier->degressive_rate_id = $data['degressive_rate_id'] ?? 2;
                $tier->fill(Arr::defaults($data, [
                    'from_day' => 4,
                    'is_rate' => false,
                    'value' => '4.00',
                ]));
            })
        );

        // - Avec des données valides.
        $this->assertTrue($generateTier()->isValid());

        // - Avec des erreurs simples.
        $tier = $generateTier([
            'from_day' => -1,
            'is_rate' => 'nok',
            'value' => '__invalid__',
        ]);
        $expectedErrors = [
            'from_day' => "Doit être supérieur ou égal à 1.",
            'is_rate' => "Ce champ doit être un booléen.",
            'value' => "Ce champ doit contenir un chiffre à virgule.",
        ];
        $this->assertFalse($tier->isValid());
        $this->assertSame($expectedErrors, $tier->validationErrors());

        // - Avec un nom déjà utilisé.
        $tier = $generateTier(['from_day' => 2]);
        $expectedErrors = [
            'from_day' => "Un palier commençant ce jour existe déjà dans ce tarif dégressif.",
        ];
        $this->assertFalse($tier->isValid());
        $this->assertSame($expectedErrors, $tier->validationErrors());

        // - Avec un jour déjà utilisé dans un autre tarif dégressif : Pas d'erreur.
        $tier = $generateTier(['tax_id' => 1]);
        $this->assertTrue($tier->isValid());

        // - Avec un taux et une valeur supérieure à 100%.
        $tier = $generateTier(['is_rate' => true, 'value' => '105']);
        $expectedErrors = [
            'value' => "Ce champ est invalide.",
        ];
        $this->assertFalse($tier->isValid());
        $this->assertSame($expectedErrors, $tier->validationErrors());

        // - Avec une valeur fixe et une valeur supérieure à 100: Valide.
        $tier = $generateTier(['value' => '105']);
        $this->assertTrue($tier->isValid());
    }
}
