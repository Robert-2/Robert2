<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class BookingsTest extends ApiTestCase
{
    public function testGetAll()
    {
        $this->client->get('/api/bookings?start=2018-12-01&end=2018-12-31');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            [
                'id' => 3,
                'entity' => 'event',
                'user_id' => 1,
                'title' => "Avant-premier événement",
                'description' => null,
                'reference' => null,
                'start_date' => "2018-12-15 00:00:00",
                'end_date' => "2018-12-16 23:59:59",
                'is_confirmed' => false,
                'is_archived' => true,
                'location' => "Brousse",
                'is_billable' => false,
                'is_return_inventory_done' => true,
                'has_missing_materials' => null,
                'has_not_returned_materials' => null,
                'parks' => [1],
                'beneficiaries' => [],
                'technicians' => [],
                'created_at' => '2018-12-14 12:20:00',
                'updated_at' => '2018-12-14 12:30:00',
            ],
            [
                'id' => 1,
                'entity' => 'event',
                'user_id' => 1,
                'title' => "Premier événement",
                'description' => null,
                'reference' => null,
                'start_date' => "2018-12-17 00:00:00",
                'end_date' => "2018-12-18 23:59:59",
                'is_confirmed' => false,
                'is_archived' => false,
                'location' => "Gap",
                'is_billable' => true,
                'is_return_inventory_done' => true,
                'has_missing_materials' => null,
                'has_not_returned_materials' => false,
                'parks' => [1],
                'beneficiaries' => [
                    BeneficiariesTest::data(1),
                ],
                'technicians' => [
                    [
                        'id' => 1,
                        'event_id' => 1,
                        'technician_id' => 1,
                        'start_time' => '2018-12-17 09:00:00',
                        'end_time' => '2018-12-18 22:00:00',
                        'position' => 'Régisseur',
                        'technician' => TechniciansTest::data(1),
                    ],
                    [
                        'id' => 2,
                        'event_id' => 1,
                        'technician_id' => 2,
                        'start_time' => '2018-12-18 14:00:00',
                        'end_time' => '2018-12-18 18:00:00',
                        'position' => 'Technicien plateau',
                        'technician' => TechniciansTest::data(2),
                    ],
                ],
                'created_at' => '2018-12-01 12:50:45',
                'updated_at' => '2018-12-05 08:31:21',
            ],
            [
                'id' => 2,
                'entity' => 'event',
                'user_id' => 1,
                'title' => "Second événement",
                'description' => null,
                'reference' => null,
                'start_date' => "2018-12-18 00:00:00",
                'end_date' => "2018-12-19 23:59:59",
                'is_confirmed' => false,
                'is_archived' => false,
                'location' => "Lyon",
                'is_billable' => true,
                'is_return_inventory_done' => true,
                'has_missing_materials' => null,
                'has_not_returned_materials' => true,
                'parks' => [1],
                'beneficiaries' => [
                    BeneficiariesTest::data(3),
                ],
                'technicians' => [],
                'created_at' => '2018-12-16 12:50:45',
                'updated_at' => null,
            ],
        ]);
    }

    public function testGetAllTooMuch()
    {
        $this->client->get('/api/bookings?start=2018-01-01&end=2018-12-31');
        $this->assertStatusCode(StatusCode::STATUS_RANGE_NOT_SATISFIABLE);
    }
}
