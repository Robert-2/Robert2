<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Models\Technician;

final class TechniciansTest extends ApiTestCase
{
    public static function data(int $id)
    {
        return static::_dataFactory($id, [
            [
                'id' => 1,
                'user_id' => 2,
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
                'full_name' => 'Roger Rabbit',
                'nickname' => 'Riri',
                'email' => 'tester2@robertmanager.net',
                'phone' => null,
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => null,
                'full_address' => null,
                'country' => null,
                'note' => null,
            ],
            [
                'id' => 2,
                'user_id' => null,
                'first_name' => 'Jean',
                'last_name' => 'Technicien',
                'full_name' => 'Jean Technicien',
                'nickname' => null,
                'email' => 'client@technicien.com',
                'phone' => '+33645698520',
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => 2,
                'full_address' => null,
                'country' => CountriesTest::data(2),
                'note' => null,
            ],
        ]);
    }

    public function testGetAll()
    {
        $this->client->get('/api/technicians');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2, [
            self::data(1),
            self::data(2),
        ]);
    }

    public function testGetAllWithSearch()
    {
        // - Prénom
        $this->client->get('/api/technicians?search=ro');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(1), // - Roger Rabbit
        ]);

        // - Prénom nom
        $this->client->get('/api/technicians?search=jean tec');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(2), // - Jean Technicien
        ]);

        // - Nom Prénom
        $this->client->get('/api/technicians?search=technicien jean');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(2), // - Jean Technicien
        ]);

        // - Email
        $this->client->get('/api/technicians?search=client@technicien.com');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(2), // - Jean Technicien (client@technicien.com)
        ]);

        // - Nickname
        $this->client->get('/api/technicians?search=rir');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(1), // - Roger Rabbit (Riri)
        ]);
    }

    public function testGetAllInPeriod()
    {
        // - Aucun technicien n'est disponible pendant ces dates
        $this->client->get('/api/technicians?startDate=2018-12-15&endDate=2018-12-20');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(0);

        // - Un technicien est disponible pendant ces dates
        $this->client->get('/api/technicians?startDate=2018-12-17&endDate=2018-12-17');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(2),
        ]);
    }

    public function testGetAllWhileEvent()
    {
        $this->client->get('/api/technicians/while-event/2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            array_merge(self::data(1), ['events' => [
                EventTechniciansTest::data(1),
            ]]),
            array_merge(self::data(2), ['events' => [
                EventTechniciansTest::data(2),
            ]]),
        ]);

        $this->client->get('/api/technicians/while-event/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            array_merge(self::data(1), ['events' => []]),
            array_merge(self::data(2), ['events' => []]),
        ]);
    }

    public function testGetEventNotFound()
    {
        $this->client->get('/api/technicians/999/events');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetEvents()
    {
        $this->client->get('/api/technicians/1/events');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            [
                'id' => 1,
                'event_id' => 1,
                'technician_id' => 1,
                'start_time' => '2018-12-17 09:00:00',
                'end_time' => '2018-12-18 22:00:00',
                'position' => 'Régisseur',
                'event' => [
                    'id' => 1,
                    'user_id' => 1,
                    'title' => 'Premier événement',
                    'description' => null,
                    'reference' => null,
                    'start_date' => '2018-12-17 00:00:00',
                    'end_date' => '2018-12-18 23:59:59',
                    'is_confirmed' => false,
                    'is_archived' => false,
                    'location' => 'Gap',
                    'is_billable' => true,
                    'is_return_inventory_done' => true,
                    'created_at' => '2018-12-01 12:50:45',
                    'updated_at' => '2018-12-05 08:31:21',
                ],
            ],
        ]);

        $this->client->get('/api/technicians/2/events');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            [
                'id' => 2,
                'event_id' => 1,
                'technician_id' => 2,
                'start_time' => '2018-12-18 14:00:00',
                'end_time' => '2018-12-18 18:00:00',
                'position' => 'Technicien plateau',
                'event' => [
                    'id' => 1,
                    'user_id' => 1,
                    'title' => 'Premier événement',
                    'description' => null,
                    'reference' => null,
                    'start_date' => '2018-12-17 00:00:00',
                    'end_date' => '2018-12-18 23:59:59',
                    'is_confirmed' => false,
                    'is_archived' => false,
                    'location' => 'Gap',
                    'is_billable' => true,
                    'is_return_inventory_done' => true,
                    'created_at' => '2018-12-01 12:50:45',
                    'updated_at' => '2018-12-05 08:31:21',
                ],
            ],
        ]);
    }

    public function testGetOneNotFound()
    {
        $this->client->get('/api/technicians/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetOne()
    {
        $this->client->get('/api/technicians/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1));
    }

    public function testCreateWithoutData()
    {
        $this->client->post('/api/technicians');
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testCreateBadData()
    {
        // - Test 1.
        $this->client->post('/api/technicians', [
            'foo' => 'bar',
            'first_name' => 'Jean-j@cques',
            'email' => 'invalid',
            'nickname' => 'ilestvraimeeeentrèslongcesurnom',
        ]);
        $this->assertApiValidationError([
            'nickname' => ["30 max. characters"],
            'first_name' => ['This field contains some unauthorized characters'],
            'last_name' => [
                "This field is mandatory",
                "This field contains some unauthorized characters",
                "2 min. characters, 35 max. characters",
            ],
            'email' => ["This email address is not valid"],
        ]);

        // - Test 2.
        $this->client->put('/api/technicians/2', [
            'first_name' => 'Tester',
            'last_name' => 'Tagger',
            'nickname' => 'TagZz',
            'email' => 'tester2@robertmanager.net',
            'phone' => 'notAphoneNumber',
        ]);
        $this->assertApiValidationError([
            'email' => ['This email address is already in use'],
            'phone' => ['This telephone number is not valid'],
        ]);
    }

    public function testCreate()
    {
        $this->client->post('/api/technicians', [
            'first_name' => 'José',
            'last_name' => 'Gatillon',
            'nickname' => 'Gégé',
            'email' => 'test@other-tech.net',
            'phone' => null,
            'street' => null,
            'postal_code' => '74000',
            'locality' => 'Annecy',
            'country_id' => 2,
            'note' => null,
        ]);

        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 3,
            'user_id' => null,
            'first_name' => 'José',
            'last_name' => 'Gatillon',
            'nickname' => 'Gégé',
            'email' => 'test@other-tech.net',
            'full_name' => 'José Gatillon',
            'phone' => null,
            'street' => null,
            'postal_code' => '74000',
            'locality' => 'Annecy',
            'country_id' => 2,
            'country' => CountriesTest::data(2),
            'full_address' => '74000 Annecy',
            'note' => null,
        ]);
    }

    public function testUpdate()
    {
        $this->client->put('/api/technicians/1', [
            'first_name' => 'José',
            'last_name' => 'Gatillon',
            'nickname' => 'Gégé',
            'postal_code' => '74000',
            'locality' => 'Annecy',
            'country_id' => 2,
        ]);

        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(static::data(1), [
            'first_name' => 'José',
            'last_name' => 'Gatillon',
            'nickname' => 'Gégé',
            'full_name' => 'José Gatillon',
            'postal_code' => '74000',
            'locality' => 'Annecy',
            'country_id' => 2,
            'country' => CountriesTest::data(2),
            'full_address' => '74000 Annecy',
        ]));
    }

    public function testDeleteAndDestroy()
    {
        // - First call: soft delete.
        $this->client->delete('/api/technicians/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $softDeleted = Technician::withTrashed()->find(2);
        $this->assertNotNull($softDeleted);
        $this->assertNotEmpty($softDeleted->deleted_at);

        // - Second call: actually DESTROY record from DB
        $this->client->delete('/api/technicians/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertNull(Technician::withTrashed()->find(2));
    }

    public function testRestoreNotFound()
    {
        $this->client->put('/api/technicians/restore/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testRestore()
    {
        // - First, delete person #2
        $this->client->delete('/api/technicians/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        // - Then, restore person #2
        $this->client->put('/api/technicians/restore/2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotNull(Technician::find(2));
    }
}
