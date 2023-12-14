<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Carbon\CarbonImmutable;
use Loxya\Models\Event;
use Loxya\Models\EventTechnician;
use Loxya\Support\Period;

final class EventTechnicianTest extends TestCase
{
    public function testValidation(): void
    {
        $eventTechnician = new EventTechnician([
            'event_id' => 4,
            'technician_id' => 1,
            'start_time' => '',
            'end_time' => '',
            'position' => 'a',
        ]);
        $this->assertEquals(
            [
                'start_time' => ["Cette date est invalide."],
                'end_time' => ["Cette date est invalide."],
                'position' => ['2 caractères min., 191 caractères max.'],
            ],
            $eventTechnician->validationErrors(),
        );
    }

    public function testValidationDatesInverted(): void
    {
        $eventTechnician = new EventTechnician([
            'event_id' => 4,
            'technician_id' => 1,
            'start_time' => '2019-03-02 10:00:00',
            'end_time' => '2019-03-01 20:00:00',
        ]);
        $this->assertEquals(
            [
                'start_time' => ['La date de fin doit être postérieure à la date de début.'],
                'end_time' => ['La date de fin doit être postérieure à la date de début.'],
            ],
            $eventTechnician->validationErrors(),
        );
    }

    public function testValidationDatesOutsideEvent(): void
    {
        // - Test 1.
        $eventTechnician = new EventTechnician([
            'event_id' => 4,
            'technician_id' => 1,
            'start_time' => '2019-01-01 10:00:00',
            'end_time' => '2021-05-01 20:00:00',
        ]);
        $this->assertEquals(
            [
                'start_time' => ["L'assignation de ce technicien commence avant l'événement."],
                'end_time' => ["L'assignation de ce technicien commence avant l'événement."],
            ],
            $eventTechnician->validationErrors(),
        );

        // - Test 2.
        $eventTechnician->start_time = '2019-05-01 10:00:00';
        $this->assertEquals(
            [
                'start_time' => ["L'assignation de ce technicien se termine après l'événement."],
                'end_time' => ["L'assignation de ce technicien se termine après l'événement."],
            ],
            $eventTechnician->validationErrors(),
        );
    }

    public function testValidationDatesNotQuarter(): void
    {
        // - Dates qui ne sont pas placées au quart d'heure près
        $eventTechnician = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_time' => '2018-12-18 22:12:00',
            'end_time' => '2018-12-18 23:35:00',
        ]);
        $this->assertEquals(
            [
                'start_time' => ["La date doit respecter une précision d'un quart d'heure (:00, :15, :30 ou :45)."],
                'end_time' => ["La date doit respecter une précision d'un quart d'heure (:00, :15, :30 ou :45)."],
            ],
            $eventTechnician->validationErrors(),
        );
    }

    public function testValidationDatesAlreadyAssigned(): void
    {
        // - Dates qui chevauchent la fin d'une assignation existante
        $eventTechnician1 = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_time' => '2018-12-18 20:00:00',
            'end_time' => '2018-12-18 22:00:00',
        ]);
        $this->assertEquals(
            [
                'start_time' => ['Ce technicien est déjà occupé pour cette période.'],
                'end_time' => ['Ce technicien est déjà occupé pour cette période.'],
            ],
            $eventTechnician1->validationErrors(),
        );

        // - Dates qui chevauchent le début d'une assignation existante
        $eventTechnician2 = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_time' => '2018-12-17 07:00:00',
            'end_time' => '2018-12-17 09:30:00',
        ]);
        $this->assertEquals(
            [
                'start_time' => ['Ce technicien est déjà occupé pour cette période.'],
                'end_time' => ['Ce technicien est déjà occupé pour cette période.'],
            ],
            $eventTechnician2->validationErrors(),
        );

        // - Dates qui sont comprises dans une assignation existante
        $eventTechnician3 = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_time' => '2018-12-17 10:00:00',
            'end_time' => '2018-12-18 20:00:00',
        ]);
        $this->assertEquals(
            [
                'start_time' => ['Ce technicien est déjà occupé pour cette période.'],
                'end_time' => ['Ce technicien est déjà occupé pour cette période.'],
            ],
            $eventTechnician3->validationErrors(),
        );
    }

    public function testValidationDatesOk(): void
    {
        // - Nouvelle assignation après une existante.
        $eventTechnician1 = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_time' => '2018-12-18 22:15:00',
            'end_time' => '2018-12-18 23:30:00',
        ]);
        $this->assertTrue($eventTechnician1->isValid());

        // - Modification d'une assignation existante.
        $eventTechnician2 = EventTechnician::findOrFail(1)->fill([
            'technician_id' => 1,
            'event_id' => 1,
            'start_time' => '2018-12-17 10:45:00',
            'end_time' => '2018-12-18 23:45:00',
        ]);
        $this->assertTrue($eventTechnician2->isValid());
    }

    public function testGetForNewDates(): void
    {
        $event = Event::findOrFail(1);
        $originalStartDate = new CarbonImmutable($event->start_date);

        // - Avec un offset de -1 mois, et une durée égale
        $newTechnicians = EventTechnician::getForNewDates(
            $event->technicians,
            $originalStartDate,
            new Period('2018-11-17 00:00:00', '2018-11-18 23:59:59'),
        );
        $expected = [
            [
                'id' => 1,
                'start_time' => '2018-11-17 09:00:00',
                'end_time' => '2018-11-18 22:00:00',
                'position' => 'Régisseur',
            ],
            [
                'id' => 2,
                'start_time' => '2018-11-18 14:00:00',
                'end_time' => '2018-11-18 18:00:00',
                'position' => 'Technicien plateau',
            ],
        ];
        $this->assertEquals($expected, $newTechnicians);

        // - Avec un offset de +1 mois, et une durée d'un jour de plus
        $newTechnicians = EventTechnician::getForNewDates(
            $event->technicians,
            $originalStartDate,
            new Period('2019-01-17 00:00:00', '2019-01-19 23:59:59'),
        );
        $expected = [
            [
                'id' => 1,
                'start_time' => '2019-01-17 09:00:00',
                'end_time' => '2019-01-18 22:00:00',
                'position' => 'Régisseur',
            ],
            [
                'id' => 2,
                'start_time' => '2019-01-18 14:00:00',
                'end_time' => '2019-01-18 18:00:00',
                'position' => 'Technicien plateau',
            ],
        ];
        $this->assertEquals($expected, $newTechnicians);

        // - Sans offset, et une durée d'un jour de moins
        $newTechnicians = EventTechnician::getForNewDates(
            $event->technicians,
            $originalStartDate,
            new Period('2019-01-17 00:00:00', '2019-01-17 23:59:59'),
        );
        $expected = [
            [
                'id' => 1,
                'start_time' => '2019-01-17 09:00:00',
                'end_time' => '2019-01-18 00:00:00',
                'position' => 'Régisseur',
            ],
        ];
        $this->assertEquals($expected, $newTechnicians);
    }
}
