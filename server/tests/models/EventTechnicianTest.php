<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Errors\Exception\ValidationException;
use Robert2\API\Models\Event;
use Robert2\API\Models\EventTechnician;

final class EventTechnicianTest extends TestCase
{
    public function testValidation()
    {
        $data = [
            'event_id' => 4,
            'technician_id' => 1,
            'start_time' => '',
            'end_time' => '',
            'position' => 'a',
        ];

        $errors = null;
        try {
            (new EventTechnician($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }

        $expectedErrors = [
            'start_time' => ["Cette date n'est pas valide"],
            'end_time' => ["Cette date n'est pas valide"],
            'position' => ['2 caractères min., 191 caractères max.'],
        ];
        $this->assertEquals($expectedErrors, $errors);
    }

    public function testValidationDatesInverted()
    {
        $data = [
            'event_id' => 4,
            'technician_id' => 1,
            'start_time' => '2019-03-02 10:00:00',
            'end_time' => '2019-03-01 20:00:00',
        ];

        $errors = null;
        try {
            (new EventTechnician($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }

        $expectedErrors = [
            'start_time' => ['La date de fin doit être postérieure à la date de début'],
            'end_time' => ['La date de fin doit être postérieure à la date de début'],
        ];
        $this->assertEquals($expectedErrors, $errors);
    }

    public function testValidationDatesOutsideEvent()
    {
        $data = [
            'event_id' => 4,
            'technician_id' => 1,
            'start_time' => '2019-01-01 10:00:00',
            'end_time' => '2021-05-01 20:00:00',
        ];

        $errors = null;
        try {
            (new EventTechnician($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $expectedErrors = [
            'start_time' => ["L'assignation de ce technicien commence avant l'événement."],
            'end_time' => ["L'assignation de ce technicien commence avant l'événement."],
        ];
        $this->assertEquals($expectedErrors, $errors);

        try {
            $data['start_time'] = '2019-05-01 10:00:00';
            (new EventTechnician($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }

        $expectedErrors = [
            'start_time' => ["L'assignation de ce technicien se termine après l'événement."],
            'end_time' => ["L'assignation de ce technicien se termine après l'événement."],
        ];
        $this->assertEquals($expectedErrors, $errors);
    }

    public function testValidationDatesNotQuarter()
    {
        // - Dates qui ne sont pas placées au quart d'heure près
        try {
            $errors = null;
            $data = [
                'technician_id' => 1,
                'event_id' => 1,
                'start_time' => '2018-12-18 22:12:00',
                'end_time' => '2018-12-18 23:35:00',
            ];
            (new EventTechnician($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertEquals([
            'start_time' => ["La date doit respecter une précision d'un quart d'heure (:00, :15, :30 ou :45)."],
            'end_time' => ["La date doit respecter une précision d'un quart d'heure (:00, :15, :30 ou :45)."],
        ], $errors);
    }

    public function testValidationDatesAlreadyAssigned()
    {
        // - Dates qui chevauchent la fin d'une assignation existante
        try {
            $errors = null;
            $data = [
                'technician_id' => 1,
                'event_id' => 1,
                'start_time' => '2018-12-18 20:00:00',
                'end_time' => '2018-12-18 22:00:00',
            ];
            (new EventTechnician($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertEquals([
            'start_time' => ['Ce technicien est déjà occupé pour cette période.'],
            'end_time' => ['Ce technicien est déjà occupé pour cette période.'],
        ], $errors);

        // - Dates qui chevauchent le début d'une assignation existante
        try {
            $errors = null;
            $data = [
                'technician_id' => 1,
                'event_id' => 1,
                'start_time' => '2018-12-17 07:00:00',
                'end_time' => '2018-12-17 09:30:00',
            ];
            (new EventTechnician($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertEquals([
            'start_time' => ['Ce technicien est déjà occupé pour cette période.'],
            'end_time' => ['Ce technicien est déjà occupé pour cette période.'],
        ], $errors);

        // - Dates qui sont comprises dans une assignation existante
        try {
            $errors = null;
            $data = [
                'technician_id' => 1,
                'event_id' => 1,
                'start_time' => '2018-12-17 10:00:00',
                'end_time' => '2018-12-18 20:00:00',
            ];
            (new EventTechnician($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertEquals([
            'start_time' => ['Ce technicien est déjà occupé pour cette période.'],
            'end_time' => ['Ce technicien est déjà occupé pour cette période.'],
        ], $errors);
    }

    public function testValidationDatesOk()
    {
        // - Nouvelle assignation après une existante
        $errors = null;
        try {
            $data = [
                'technician_id' => 1,
                'event_id' => 1,
                'start_time' => '2018-12-18 22:15:00',
                'end_time' => '2018-12-18 23:30:00',
            ];
            (new EventTechnician($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertNull($errors);

        // - Modification d'une assignation existante
        try {
            $eventTechnician = (new EventTechnician)->find(1);
            $data = [
                'technician_id' => 1,
                'event_id' => 1,
                'start_time' => '2018-12-17 10:45:00',
                'end_time' => '2018-12-18 23:45:00',
            ];
            $eventTechnician->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertNull($errors);
    }

    public function testGetForNewDates()
    {
        $event = Event::findOrFail(1);
        $originalStartDate = new \DateTime($event->start_date);

        // - Avec un offset de -1 mois, et une durée égale
        $newTechnicians = EventTechnician::getForNewDates($event->technicians, $originalStartDate, [
            'start_date' => '2018-11-17 00:00:00',
            'end_date' => '2018-11-18 23:59:59',
        ]);
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
        $newTechnicians = EventTechnician::getForNewDates($event->technicians, $originalStartDate, [
            'start_date' => '2019-01-17 00:00:00',
            'end_date' => '2019-01-19 23:59:59',
        ]);
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
        $newTechnicians = EventTechnician::getForNewDates($event->technicians, $originalStartDate, [
            'start_date' => '2019-01-17 00:00:00',
            'end_date' => '2019-01-17 23:59:59',
        ]);
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
