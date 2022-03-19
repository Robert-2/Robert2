<?php
namespace Robert2\Tests;

final class EventTechniciansTest extends ApiTestCase
{
    public function testGetOneEventTechnician()
    {
        $this->client->get('/api/event-technicians/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'event_id' => 1,
            'technician_id' => 1,
            'start_time' => '2018-12-17 09:00:00',
            'end_time' => '2018-12-18 22:00:00',
            'position' => 'Régisseur',
            'technician' => [
                'id' => 1,
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'nickname' => null,
                'phone' => null,
                'full_name' => 'Jean Fountain',
                'country' => null,
                'full_address' => null,
                'company' => null,
            ],
        ]);
    }

    public function testCreateEventTechnician()
    {
        $data = [
            'event_id' => 1,
            'technician_id' => 2,
            'start_time' => '2018-12-17 10:00:00',
            'end_time' => '2018-12-17 20:30:00',
            'position' => 'Testeur',
        ];
        $this->client->post('/api/event-technicians', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 3,
            'event_id' => 1,
            'technician_id' => 2,
            'start_time' => '2018-12-17 10:00:00',
            'end_time' => '2018-12-17 20:30:00',
            'position' => 'Testeur',
            'technician' => [
                'id' => 2,
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
                'nickname' => 'Riri',
                'phone' => null,
                'full_name' => 'Roger Rabbit',
                'country' => null,
                'full_address' => null,
                'company' => null,
            ],
        ]);
    }

    public function testUpdateEventTechnicianNoData()
    {
        $this->client->put('/api/event-technicians/1', []);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testUpdateEventTechnician()
    {
        $data = [
            'start_time' => '2018-12-17 10:00:00',
            'end_time' => '2018-12-18 20:00:00',
            'position' => 'Régisseur général',
        ];
        $this->client->put('/api/event-technicians/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'event_id' => 1,
            'technician_id' => 1,
            'start_time' => '2018-12-17 10:00:00',
            'end_time' => '2018-12-18 20:00:00',
            'position' => 'Régisseur général',
            'technician' => [
                'id' => 1,
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'nickname' => null,
                'phone' => null,
                'full_name' => 'Jean Fountain',
                'country' => null,
                'full_address' => null,
                'company' => null,
            ],
        ]);
    }

    public function testDestroyEventTechnician()
    {
        $this->client->delete('/api/event-technicians/2');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }
}
