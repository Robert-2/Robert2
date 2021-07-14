<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Errors\ValidationException;
use Robert2\API\Models;

final class EventTechnicianTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\EventTechnician();
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
}
