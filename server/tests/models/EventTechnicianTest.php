<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\EventTechnician;
use Loxya\Support\Period;

final class EventTechnicianTest extends TestCase
{
    public function testValidation(): void
    {
        // - Test simple.
        $eventTechnician1 = new EventTechnician([
            'event_id' => 4,
            'technician_id' => 1,
            'start_date' => '',
            'end_date' => '',
            'position' => 'a',
        ]);
        $expectedErrors1 = [
            'start_date' => ["Ce champ est invalide."],
            'end_date' => ["Ce champ est invalide."],
            'position' => ['2 caractères min., 191 caractères max.'],
        ];
        $this->assertSameCanonicalize($expectedErrors1, $eventTechnician1->validationErrors());

        // - Test avec des dates inversées.
        $eventTechnician2 = new EventTechnician([
            'event_id' => 4,
            'technician_id' => 1,
            'start_date' => '2019-03-02 10:00:00',
            'end_date' => '2019-03-01 20:00:00',
        ]);
        $expectedErrors2 = [
            'start_date' => ['La date de fin doit être postérieure à la date de début.'],
            'end_date' => ['La date de fin doit être postérieure à la date de début.'],
        ];
        $this->assertSameCanonicalize($expectedErrors2, $eventTechnician2->validationErrors());

        // - Test avec des dates en dehors de l'événement (1).
        $eventTechnician3 = new EventTechnician([
            'event_id' => 4,
            'technician_id' => 1,
            'start_date' => '2019-01-01 10:00:00',
            'end_date' => '2021-05-01 20:00:00',
        ]);
        $expectedErrors3 = [
            'start_date' => ["La période d'assignation du technicien est en dehors de la période de l'événement."],
            'end_date' => ["La période d'assignation du technicien est en dehors de la période de l'événement."],
        ];
        $this->assertSameCanonicalize($expectedErrors3, $eventTechnician3->validationErrors());

        // - Test avec des dates en dehors de l'événement (2).
        $eventTechnician3->start_date = '2019-05-01 10:00:00';
        $expectedErrors4 = [
            'start_date' => ["La période d'assignation du technicien est en dehors de la période de l'événement."],
            'end_date' => ["La période d'assignation du technicien est en dehors de la période de l'événement."],
        ];
        $this->assertSameCanonicalize($expectedErrors4, $eventTechnician3->validationErrors());

        // - Test avec des dates non arrondies au quart d'heure.
        $eventTechnician5 = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_date' => '2018-12-18 22:12:00',
            'end_date' => '2018-12-18 23:35:00',
        ]);
        $expectedErrors5 = [
            'start_date' => ["La date doit être arrondie au quart d'heure le plus proche."],
            'end_date' => ["La date doit être arrondie au quart d'heure le plus proche."],
        ];
        $this->assertSameCanonicalize($expectedErrors5, $eventTechnician5->validationErrors());

        // - Test avec des dates qui chevauchent la fin d'une assignation existante.
        $eventTechnician6 = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_date' => '2018-12-18 20:00:00',
            'end_date' => '2018-12-18 22:00:00',
        ]);
        $expectedErrors6 = [
            'start_date' => ['Ce technicien est déjà occupé pour cette période.'],
            'end_date' => ['Ce technicien est déjà occupé pour cette période.'],
        ];
        $this->assertSameCanonicalize($expectedErrors6, $eventTechnician6->validationErrors());

        // - Test avec des dates qui chevauchent le début d'une assignation existante.
        $eventTechnician7 = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_date' => '2018-12-17 07:00:00',
            'end_date' => '2018-12-17 09:30:00',
        ]);
        $expectedErrors7 = [
            'start_date' => ['Ce technicien est déjà occupé pour cette période.'],
            'end_date' => ['Ce technicien est déjà occupé pour cette période.'],
        ];
        $this->assertSameCanonicalize($expectedErrors7, $eventTechnician7->validationErrors());

        // - Test avec des dates qui sont comprises dans une assignation existante.
        $eventTechnician8 = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_date' => '2018-12-17 10:00:00',
            'end_date' => '2018-12-18 20:00:00',
        ]);
        $expectedErrors8 = [
            'start_date' => ['Ce technicien est déjà occupé pour cette période.'],
            'end_date' => ['Ce technicien est déjà occupé pour cette période.'],
        ];
        $this->assertSameCanonicalize($expectedErrors8, $eventTechnician8->validationErrors());

        // - Test valide: Nouvelle assignation après une existante.
        $eventTechnician9 = new EventTechnician([
            'technician_id' => 1,
            'event_id' => 1,
            'start_date' => '2018-12-18 22:15:00',
            'end_date' => '2018-12-18 23:30:00',
        ]);
        $this->assertTrue($eventTechnician9->isValid());

        // - Test valide: Modification d'une assignation existante.
        $eventTechnician10 = EventTechnician::findOrFail(1)->fill([
            'technician_id' => 1,
            'event_id' => 1,
            'start_date' => '2018-12-17 10:45:00',
            'end_date' => '2018-12-18 23:45:00',
        ]);
        $this->assertTrue($eventTechnician10->isValid());
    }

    public function testComputeNewPeriod(): void
    {
        // - Si les nouvelles dates comprennent l'assignation, pas de changement.
        $expected = new Period('2018-12-17 09:00:00', '2018-12-18 22:00:00');
        $result = EventTechnician::findOrFail(1)->computeNewPeriod($expected);
        $this->assertEquals($expected, $result);

        $period = new Period('2018-12-17', '2018-12-18', true);
        $result = EventTechnician::findOrFail(1)->computeNewPeriod($period);
        $this->assertEquals($expected, $result);

        // - Si les nouvelles dates comprennent en partie l'assignation, on tronque.
        $period = new Period('2018-12-17', '2018-12-17', true);
        $expected = new Period('2018-12-17 09:00:00', '2018-12-18 00:00:00');
        $result = EventTechnician::findOrFail(1)->computeNewPeriod($period);
        $this->assertEquals($expected, $result);

        $period = new Period('2018-12-17 08:00:00', '2018-12-17 09:30:00');
        $expected = new Period('2018-12-17 09:00:00', '2018-12-17 09:30:00');
        $result = EventTechnician::findOrFail(1)->computeNewPeriod($period);
        $this->assertEquals($expected, $result);

        $period = new Period('2018-12-17 10:22:00', '2018-12-18 08:12:00');
        $expected = new Period('2018-12-17 10:30:00', '2018-12-18 08:00:00');
        $result = EventTechnician::findOrFail(1)->computeNewPeriod($period);
        $this->assertEquals($expected, $result);

        // - Si les nouvelles dates ne permettant pas de conserver l'assignation, on retourne `null`.
        $period = new Period('2018-12-18 22:00:00', '2018-12-18 23:00:00');
        $result = EventTechnician::findOrFail(1)->computeNewPeriod($period);
        $this->assertNull($result);

        $period = new Period('2018-12-17 08:00:00', '2018-12-17 09:00:00');
        $result = EventTechnician::findOrFail(1)->computeNewPeriod($period);
        $this->assertNull($result);
    }
}
