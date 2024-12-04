<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Carbon\Carbon;
use Loxya\Models\OpeningHour;
use Loxya\Support\Arr;

final class OpeningHourTest extends TestCase
{
    public function testValidation(): void
    {
        $generateOpeningHour = static fn (array $data = []): OpeningHour => (
            new OpeningHour(Arr::defaults($data, [
                'weekday' => 2, // - Mardi.
                'start_time' => '08:15:00',
                'end_time' => '17:45:00',
            ]))
        );

        // - Avec des données valides.
        $this->assertTrue($generateOpeningHour()->isValid());

        // - Si le jour de la semaine n'est pas valide.
        foreach ([null, '__INVALID__'] as $invalidWeekday) {
            $openingHour = $generateOpeningHour(['weekday' => $invalidWeekday]);
            $expectedErrors = ['weekday' => "Ce champ est invalide."];
            $this->assertFalse($openingHour->isValid());
            $this->assertSame($expectedErrors, $openingHour->validationErrors());
        }

        // - Si le jour de la semaine n'est pas valide: PAs dans l'intervalle 0 à 6.
        $openingHour = $generateOpeningHour(['weekday' => 15]);
        $expectedErrors = ['weekday' => "Ce champ est invalide."];
        $this->assertFalse($openingHour->isValid());
        $this->assertSame($expectedErrors, $openingHour->validationErrors());

        // - Si les heures ne sont pas arrondies au quart d'heure.
        $openingHour = $generateOpeningHour([
            'start_time' => '08:12:00',
            'end_time' => '17:20:00',
        ]);
        $expectedErrors = [
            'start_time' => "L'heure doit être arrondie au quart d'heure le plus proche.",
            'end_time' => "L'heure doit être arrondie au quart d'heure le plus proche.",
        ];
        $this->assertFalse($openingHour->isValid());
        $this->assertSame($expectedErrors, $openingHour->validationErrors());

        // - Si l'heure d'ouverture est égale à l'heure de fermeture.
        $openingHour = $generateOpeningHour(['start_time' => '17:45:00']);
        $expectedErrors = [
            'start_time' => "L'heure de fin doit être après l'heure de début.",
            'end_time' => "L'heure de fin doit être après l'heure de début.",
        ];
        $this->assertFalse($openingHour->isValid());
        $this->assertSame($expectedErrors, $openingHour->validationErrors());

        // - Si l'heure d'ouverture est après l'heure de fermeture.
        $openingHour = $generateOpeningHour(['start_time' => '18:00:00']);
        $expectedErrors = [
            'start_time' => "L'heure de fin doit être après l'heure de début.",
            'end_time' => "L'heure de fin doit être après l'heure de début.",
        ];
        $this->assertFalse($openingHour->isValid());
        $this->assertSame($expectedErrors, $openingHour->validationErrors());

        // - Si des horaires d'ouvertures sont déjà configurées
        //   (et chevaucheront les nouvelles) pour la période.
        $openingHour = $generateOpeningHour(['weekday' => 1]);
        $expectedErrors = [
            'start_time' => "Cette période entre en conflit avec une période déjà existante.",
            'end_time' => "Cette période entre en conflit avec une période déjà existante.",
        ];
        $this->assertFalse($openingHour->isValid());
        $this->assertSame($expectedErrors, $openingHour->validationErrors());

        // - Si on modifie des horaires d'ouvertures déjà configurées pour la période.
        $openingHour = tap(
            OpeningHour::findOrFail(1),
            static function (OpeningHour $openingHour) {
                $openingHour->fill([
                    'start_time' => '08:15:00',
                    'end_time' => '17:45:00',
                ]);
            },
        );
        $this->assertTrue($openingHour->isValid());
    }

    public function testIsOpenDay(): void
    {
        // - Test simple.
        $this->assertTrue(OpeningHour::isOpenDay(Carbon::parse('2024-03-03 12:00:00')));

        // - Test avec une heure ou l'établissement est fermé.
        //   (mais vu qu'on teste le - jour -, le test doit renvoyer `true`)
        $this->assertTrue(OpeningHour::isOpenDay(Carbon::parse('2024-03-03 08:00:00')));

        // - Test lors d'une fermeture journalière.
        $this->assertFalse(OpeningHour::isOpenDay(Carbon::parse('2024-03-05 14:00:00')));
    }

    public function testIsOpen(): void
    {
        // - Test simple.
        $this->assertTrue(OpeningHour::isOpen(Carbon::parse('2024-03-03 12:00:00')));

        // - Test avec un `00:00:00` alors que la vaille à `24:00:00` l'établissement est ouvert.
        $this->assertTrue(OpeningHour::isOpen(Carbon::parse('2024-03-08 00:00:00')));

        // - Test avec une heure d'ouverture / fermeture (considérés comme ouvertes).
        $this->assertTrue(OpeningHour::isOpen(Carbon::parse('2024-03-03 09:00:00')));
        $this->assertTrue(OpeningHour::isOpen(Carbon::parse('2024-03-03 18:00:00')));

        // - Test avec une heure ou l'établissement est fermé.
        $this->assertFalse(OpeningHour::isOpen(Carbon::parse('2024-03-03 08:00:00')));

        // - Test lors d'une fermeture journalière.
        $this->assertFalse(OpeningHour::isOpen(Carbon::parse('2024-03-05 14:00:00')));
    }
}
