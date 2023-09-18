<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Support\Arr;
use Loxya\Models\Beneficiary;
use Illuminate\Support\Collection;

final class BeneficiariesTest extends ApiTestCase
{
    public static function data(int $id, string $format = Beneficiary::SERIALIZE_DEFAULT)
    {
        $beneficiaries = new Collection([
            [
                'id' => 1,
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'full_name' => 'Jean Fountain',
                'reference' => '0001',
                'email' => 'tester@robertmanager.net',
                'phone' => null,
                'street' => "1, somewhere av.",
                'postal_code' => '1234',
                'locality' => "Megacity",
                'user_id' => 1,
                'country_id' => 1,
                'full_address' => "1, somewhere av.\n1234 Megacity",
                'company_id' => 1,
                'note' => null,
                'company' => CompaniesTest::data(1),
                'country' => CountriesTest::data(1),
                'can_make_reservation' => true,
                'user' => UsersTest::data(1),
            ],
            [
                'id' => 2,
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
                'full_name' => 'Roger Rabbit',
                'reference' => '0002',
                'email' => 'tester2@robertmanager.net',
                'phone' => null,
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'user_id' => 2,
                'country_id' => null,
                'full_address' => null,
                'company_id' => null,
                'note' => null,
                'company' => null,
                'country' => null,
                'can_make_reservation' => true,
                'user' => UsersTest::data(2),
            ],
            [
                'id' => 3,
                'first_name' => 'Client',
                'last_name' => 'Benef',
                'full_name' => 'Client Benef',
                'reference' => '0003',
                'email' => 'client@beneficiaires.com',
                'phone' => '+33123456789',
                'street' => '156 bis, avenue des tests poussés',
                'postal_code' => '88080',
                'locality' => 'Wazzaville',
                'full_address' => "156 bis, avenue des tests poussés\n88080 Wazzaville",
                'user_id' => null,
                'country_id' => null,
                'company_id' => null,
                'note' => null,
                'company' => null,
                'country' => null,
                'can_make_reservation' => false,
                'user' => null,
            ],
            [
                'id' => 4,
                'first_name' => 'Alphonse',
                'last_name' => 'Latour',
                'full_name' => 'Alphonse Latour',
                'reference' => '0004',
                'email' => 'alphonse@latour.test',
                'phone' => null,
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'full_address' => null,
                'user_id' => null,
                'country_id' => null,
                'company_id' => null,
                'note' => null,
                'company' => null,
                'country' => null,
                'can_make_reservation' => false,
                'user' => null,
            ],
        ]);

        $beneficiaries = match ($format) {
            Beneficiary::SERIALIZE_DEFAULT => $beneficiaries->map(fn($material) => (
                Arr::except($material, ['user'])
            )),
            Beneficiary::SERIALIZE_DETAILS => $beneficiaries,
            default => throw new \InvalidArgumentException(sprintf("Unknown format \"%s\"", $format)),
        };

        return static::_dataFactory($id, $beneficiaries->all());
    }

    public function testGetAll(): void
    {
        $this->client->get('/api/beneficiaries');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(4, [
            self::data(3),
            self::data(1),
            self::data(4),
            self::data(2),
        ]);
    }

    public function testGetAllWithSearch(): void
    {
        // - Prénom
        $this->client->get('/api/beneficiaries?search=cli');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(3), // - Client Benef
        ]);

        // - Prénom nom
        $this->client->get('/api/beneficiaries?search=client ben');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(3), // - Client Benef
        ]);

        // - Nom Prénom
        $this->client->get('/api/beneficiaries?search=fountain jean');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(1), // - Jean Fountain
        ]);

        // - Email
        $this->client->get('/api/beneficiaries?search=@robertmanager.net');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2, [
            self::data(1), // - Jean Fountain (tester@robertmanager.net)
            self::data(2), // - Roger Rabbit (tester2@robertmanager.net)
        ]);

        // - Référence
        $this->client->get('/api/beneficiaries?search=0001');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(1), // - Jean Fountain (0001)
        ]);

        // - Société
        $this->client->get('/api/beneficiaries?search=testing,+inc');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(1), // - Jean Fountain (Testing, Inc)
        ]);
    }

    public function testGetOneNotFound(): void
    {
        $this->client->get('/api/beneficiaries/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetOne(): void
    {
        $this->client->get('/api/beneficiaries/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1, Beneficiary::SERIALIZE_DETAILS));
    }

    public function testCreateWithoutData(): void
    {
        $this->client->post('/api/beneficiaries');
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testCreateBadData(): void
    {
        $this->client->post('/api/beneficiaries', [
            'foo' => 'bar',
            'first_name' => 'Jean-j@cques',
            'email' => 'invalid',
            'reference' => '0001',
        ]);
        $this->assertApiValidationError([
            'first_name' => ['This field contains some unauthorized characters'],
            'last_name' => [
                "This field is mandatory",
                "This field contains some unauthorized characters",
                "2 min. characters, 35 max. characters",
            ],
            'reference' => ['This reference is already in use'],
            'email' => ["This email address is not valid"],
        ]);
    }

    public function testCreate(): void
    {
        $this->client->post('/api/beneficiaries', [
            'first_name' => 'José',
            'last_name' => 'Gatillon',
            'email' => 'test@other-benef.net',
            'reference' => '0005',
            'company_id' => 2,
            'phone' => null,
            'street' => '1 rue du test',
            'postal_code' => '74000',
            'locality' => 'Annecy',
            'country_id' => 2,
            'can_make_reservation' => false,
            'note' => null,
        ]);

        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 5,
            'user_id' => null,
            'first_name' => 'José',
            'last_name' => 'Gatillon',
            'reference' => '0005',
            'email' => 'test@other-benef.net',
            'full_name' => 'José Gatillon',
            'company_id' => 2,
            'company' => CompaniesTest::data(2),
            'phone' => null,
            'street' => '1 rue du test',
            'postal_code' => '74000',
            'locality' => 'Annecy',
            'country_id' => 2,
            'country' => CountriesTest::data(2),
            'full_address' => "1 rue du test\n74000 Annecy",
            'can_make_reservation' => false,
            'user' => null,
            'note' => null,
        ]);

        // - Test avec une adresse e-mail existante.
        $this->client->post('/api/beneficiaries', [
            'first_name' => 'Tester',
            'last_name' => 'Leblanc',
            'can_make_reservation' => false,
            'pseudo' => 'new-test',
            'email' => 'tester@robertmanager.net',
            'password' => '0123456',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
    }

    public function testUpdateBadData()
    {
        $this->client->put('/api/beneficiaries/2', [
            'first_name' => 'Tester',
            'last_name' => 'Tagger',
            'email' => 'invalid',
            'phone' => 'notAphoneNumber',
        ]);
        $this->assertApiValidationError([
            'email' => ['This email address is not valid'],
            'phone' => ['This telephone number is not valid'],
        ]);
    }

    public function testUpdate(): void
    {
        $this->client->put('/api/beneficiaries/1', [
            'first_name' => 'José',
            'last_name' => 'Gatillon',
            'postal_code' => '74000',
            'locality' => 'Annecy',
            'country_id' => 2,
            'note' => "Très bon client.",
        ]);

        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(
            self::data(1, Beneficiary::SERIALIZE_DETAILS),
            [
                'first_name' => 'José',
                'last_name' => 'Gatillon',
                'full_name' => 'José Gatillon',
                'postal_code' => '74000',
                'locality' => 'Annecy',
                'country_id' => 2,
                'country' => CountriesTest::data(2),
                'full_address' => "1, somewhere av.\n74000 Annecy",
                'note' => "Très bon client.",
                'user' => array_merge(UsersTest::data(1), [
                    'first_name' => 'José',
                    'last_name' => 'Gatillon',
                    'full_name' => 'José Gatillon',
                ]),
            ]
        ));
    }

    public function testDeleteAndDestroy(): void
    {
        // - First call: soft delete.
        $this->client->delete('/api/beneficiaries/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $softDeleted = Beneficiary::withTrashed()->find(2);
        $this->assertNotNull($softDeleted);
        $this->assertNotEmpty($softDeleted->deleted_at);

        // - Second call: actually DESTROY record from DB
        $this->client->delete('/api/beneficiaries/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertNull(Beneficiary::withTrashed()->find(2));
    }

    public function testRestoreNotFound(): void
    {
        $this->client->put('/api/beneficiaries/restore/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testRestore(): void
    {
        // - First, delete person #2
        $this->client->delete('/api/beneficiaries/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        // - Then, restore person #2
        $this->client->put('/api/beneficiaries/restore/2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotNull(self::data(2, Beneficiary::SERIALIZE_DETAILS));
    }
}
