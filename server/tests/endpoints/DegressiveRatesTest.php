<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class DegressiveRatesTest extends ApiTestCase
{
    public static function data(?int $id = null)
    {
        return static::dataFactory($id, [
            [
                'id' => 1,
                'name' => "Base",
                'is_used' => true,
                'tiers' => [
                    [
                        'from_day' => 1,
                        'is_rate' => false,
                        'value' => '1.00',
                    ],
                    [
                        'from_day' => 2,
                        'is_rate' => false,
                        'value' => '1.75',
                    ],
                    [
                        'from_day' => 3,
                        'is_rate' => false,
                        'value' => '2.50',
                    ],
                    [
                        'from_day' => 4,
                        'is_rate' => false,
                        'value' => '3.25',
                    ],
                    [
                        'from_day' => 5,
                        'is_rate' => false,
                        'value' => '4.00',
                    ],
                    [
                        'from_day' => 6,
                        'is_rate' => true,
                        'value' => '75.42',
                    ],
                ],
            ],
            [
                'id' => 2,
                'name' => "Transport",
                'is_used' => true,
                'tiers' => [
                    [
                        'from_day' => 1,
                        'is_rate' => true,
                        'value' => '100',
                    ],
                    [
                        'from_day' => 2,
                        'is_rate' => true,
                        'value' => '75.00',
                    ],
                ],
            ],
            [
                'id' => 3,
                'name' => "Fixe",
                'is_used' => true,
                'tiers' => [
                    [
                        'from_day' => 1,
                        'is_rate' => false,
                        'value' => '1.00',
                    ],
                ],
            ],
            [
                'id' => 4,
                'name' => "100%",
                'is_used' => false,
                'tiers' => [
                    [
                        'from_day' => 1,
                        'is_rate' => true,
                        'value' => '100',
                    ],
                ],
            ],
        ]);
    }

    public function testGetAll(): void
    {
        $this->client->get('/api/degressive-rates');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data());
    }

    public function testCreate(): void
    {
        // - Test 1.
        $this->client->post('/api/degressive-rates', [
            'name' => '',
        ]);
        $this->assertApiValidationError([
            'name' => "This field is mandatory.",
        ]);

        // - Test 2.
        $this->client->post('/api/degressive-rates', [
            'name' => "Transport",
        ]);
        $this->assertApiValidationError([
            'name' => "A degressive rate with this name already exists.",
        ]);

        // - Test 3.
        $this->client->post('/api/degressive-rates', [
            'name' => "Service",
            'is_group' => true,
            'tiers' => [
                [
                    'from_day' => 1,
                    'is_rate' => true,
                    'value' => '100',
                ],
                [
                    'from_day' => 2,
                    'is_rate' => true,
                    'value' => '105',
                ],
                [
                    'from_day' => '',
                    'is_rate' => false,
                    'value' => '__invalid__',
                ],
            ],
        ]);
        $this->assertApiValidationError([
            'tiers' => [
                1 => [
                    'value' => "This field is invalid.",
                ],
                2 => [
                    'from_day' => "This field must contain an integer.",
                    'value' => "This field must contain a decimal number.",
                ],
            ],
        ]);

        // - Test 4: Valide.
        $this->client->post('/api/degressive-rates', [
            'name' => "Service",
            'tiers' => [
                [
                    'from_day' => 1,
                    'is_rate' => true,
                    'value' => '100',
                ],
                [
                    'from_day' => 2,
                    'is_rate' => true,
                    'value' => '95',
                ],
                [
                    'from_day' => 10,
                    'is_rate' => false,
                    'value' => '10',
                ],
            ],
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 6,
            'name' => "Service",
            'is_used' => false,
            'tiers' => [
                [
                    'from_day' => 1,
                    'is_rate' => true,
                    'value' => '100.00',
                ],
                [
                    'from_day' => 2,
                    'is_rate' => true,
                    'value' => '95.00',
                ],
                [
                    'from_day' => 10,
                    'is_rate' => false,
                    'value' => '10.00',
                ],
            ],
        ]);
    }

    public function testUpdate(): void
    {
        // - Test 1.
        $this->client->put('/api/degressive-rates/1', [
            'name' => '',
        ]);
        $this->assertApiValidationError([
            'name' => "This field is mandatory.",
        ]);

        // - Test 2.
        $this->client->put('/api/degressive-rates/2', [
            'name' => "Base",
        ]);
        $this->assertApiValidationError([
            'name' => "A degressive rate with this name already exists.",
        ]);

        // - Test 3 : Valide.
        $this->client->put('/api/degressive-rates/1', [
            'name' => "Base 2024",
            'tiers' => [
                [
                    'from_day' => 1,
                    'is_rate' => false,
                    'value' => '1.00',
                ],
                [
                    'from_day' => 3,
                    'is_rate' => true,
                    'value' => '85',
                ],
                [
                    'from_day' => 2,
                    'is_rate' => false,
                    'value' => '2.00',
                ],
            ],
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'id' => 1,
            'name' => "Base 2024",
            'is_used' => true,
            'tiers' => [
                [
                    'from_day' => 1,
                    'is_rate' => false,
                    'value' => '1.00',
                ],
                [
                    'from_day' => 2,
                    'is_rate' => false,
                    'value' => '2.00',
                ],
                [
                    'from_day' => 3,
                    'is_rate' => true,
                    'value' => '85.00',
                ],
            ],
        ]);
    }

    public function testDelete(): void
    {
        // - On ne peut pas supprimer le tarif dégressif par défaut.
        $this->client->delete('/api/degressive-rates/1');
        $this->assertStatusCode(StatusCode::STATUS_CONFLICT);

        // - On ne peut pas supprimer un tarif dégressif utilisé.
        $this->client->delete('/api/degressive-rates/2');
        $this->assertStatusCode(StatusCode::STATUS_CONFLICT);

        // - Test valide.
        $this->client->delete('/api/degressive-rates/4');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
    }
}
