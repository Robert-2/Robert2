<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Event;
use Robert2\API\Models\EventTechnician;

final class EventTechnicianTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new EventTechnician();
    }

    public function testTableName(): void
    {
        $this->assertEquals('event_technicians', $this->model->getTable());
    }

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
            $this->model->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }

        $expectedErrors = [
            'start_time' => ['start_time must be valid'],
            'end_time' => ['end_time must be valid'],
            'position' => ['position must have a length between 2 and 191'],
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
            $this->model->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }

        $expectedErrors = [
            'start_time' => ['End date must be later than start date'],
            'end_time' => ['End date must be later than start date'],
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
            $this->model->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $expectedErrors = [
            'start_time' => ['Assignment of this technician begins before the event.'],
            'end_time' => ['Assignment of this technician begins before the event.'],
        ];
        $this->assertEquals($expectedErrors, $errors);

        try {
            $data['start_time'] = '2019-05-01 10:00:00';
            $this->model->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }

        $expectedErrors = [
            'start_time' => ['Assignment of this technician ends after the event.'],
            'end_time' => ['Assignment of this technician ends after the event.'],
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
            $this->model->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertEquals([
            'start_time' => ['Date must respect precision of a quarter (:00, :15, :30 or :45).'],
            'end_time' => ['Date must respect precision of a quarter (:00, :15, :30 or :45).'],
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
            $this->model->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertEquals([
            'start_time' => ['This technician is already busy for this period.'],
            'end_time' => ['This technician is already busy for this period.'],
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
            $this->model->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertEquals([
            'start_time' => ['This technician is already busy for this period.'],
            'end_time' => ['This technician is already busy for this period.'],
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
            $this->model->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertEquals([
            'start_time' => ['This technician is already busy for this period.'],
            'end_time' => ['This technician is already busy for this period.'],
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
            $this->model->fill($data)->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }
        $this->assertNull($errors);

        // - Modification d'une assignation existante
        try {
            $eventTechnician = $this->model->find(1);
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
            ]
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
            ]
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
                'end_time' => '2019-01-17 23:45:00',
                'position' => 'Régisseur',
            ],
        ];
        $this->assertEquals($expected, $newTechnicians);
    }
}
