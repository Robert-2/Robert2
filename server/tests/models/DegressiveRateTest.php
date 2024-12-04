<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\DegressiveRate;
use Loxya\Support\Arr;

final class DegressiveRateTest extends TestCase
{
    public function testValidation(): void
    {
        $generateDegressiveRate = static function (array $data = []): DegressiveRate {
            $data = Arr::defaults($data, [
                'name' => "Tarif dégressif",
            ]);
            return new DegressiveRate($data);
        };

        // - Avec des données valides.
        $this->assertTrue($generateDegressiveRate()->isValid());

        // - Avec des erreurs simples (1).
        $degressiveRate = $generateDegressiveRate([
            'name' => '',
        ]);
        $expectedErrors = [
            'name' => "Ce champ est obligatoire.",
        ];
        $this->assertFalse($degressiveRate->isValid());
        $this->assertSame($expectedErrors, $degressiveRate->validationErrors());

        // - Avec des erreurs simples (2).
        $degressiveRate = $generateDegressiveRate([
            'name' => 'invalideeeeeeeeeeeeeeeeeeeeeeee',
        ]);
        $expectedErrors = [
            'name' => "1 caractères min., 30 caractères max.",
        ];
        $this->assertFalse($degressiveRate->isValid());
        $this->assertSame($expectedErrors, $degressiveRate->validationErrors());

        // - Avec un nom déjà utilisé.
        $degressiveRate = $generateDegressiveRate([
            'name' => "Base",
        ]);
        $expectedErrors = [
            'name' => "Un tarif dégressif avec ce nom existe déjà.",
        ];
        $this->assertFalse($degressiveRate->isValid());
        $this->assertSame($expectedErrors, $degressiveRate->validationErrors());
    }

    public function testDelete(): void
    {
        // - Ne peut pas être supprimé si c'est le tarif dégressif par défaut.
        $this->assertThrow(\LogicException::class, static function () {
            DegressiveRate::findOrFail(1)->delete();
        });

        // - Ne peut pas être supprimée si utilisé.
        $this->assertThrow(\LogicException::class, static function () {
            DegressiveRate::findOrFail(2)->delete();
        });

        // - Test valide.
        $isDeleted = DegressiveRate::findOrFail(4)->delete();
        $this->assertTrue($isDeleted);
        $this->assertFalse(DegressiveRate::includes(4));
    }

    public function testComputeForDays(): void
    {
        // - Tarif dégressif fixe.
        $degressiveRate1 = DegressiveRate::find(3);
        $this->assertSame('1.00', (string) $degressiveRate1->computeForDays(1));
        $this->assertSame('1.00', (string) $degressiveRate1->computeForDays(10));

        // - Tarif dégressif ... non dégressif.
        $degressiveRate1 = DegressiveRate::find(4);
        $this->assertSame('1.00', (string) $degressiveRate1->computeForDays(1));
        $this->assertSame('10.00', (string) $degressiveRate1->computeForDays(10));

        // - Tarif dégressif complexe.
        $degressiveRate1 = DegressiveRate::find(1);
        $this->assertSame('1.00', (string) $degressiveRate1->computeForDays(1));
        $this->assertSame('3.25', (string) $degressiveRate1->computeForDays(4));
        $this->assertSame('7.55', (string) $degressiveRate1->computeForDays(10));
    }
}
