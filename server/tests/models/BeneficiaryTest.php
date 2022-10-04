<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Beneficiary;

final class BeneficiaryTest extends TestCase
{
    public function testSetSearch(): void
    {
        // - Prénom
        $result = (new Beneficiary)->setSearch('cli')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Client Benef'], $result->pluck('full_name')->all());

        // - Prénom nom
        $result = (new Beneficiary)->setSearch('client ben')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Client Benef'], $result->pluck('full_name')->all());

        // - Nom Prénom
        $result = (new Beneficiary)->setSearch('fountain jean')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Fountain'], $result->pluck('full_name')->all());

        // - Email
        $result = (new Beneficiary)->setSearch('@robertmanager.net')->getAll()->get();
        $this->assertEquals(2, $result->count());
        $this->assertEquals(['Jean Fountain', 'Roger Rabbit'], $result->pluck('full_name')->all());

        // - Référence
        $result = (new Beneficiary)->setSearch('0001')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Fountain'], $result->pluck('full_name')->all());

        // - Société
        $result = (new Beneficiary)->setSearch('Testing')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Fountain'], $result->pluck('full_name')->all());
    }

    public function testUnserialize(): void
    {
        $result = Beneficiary::unserialize([
            'first_name' => 'Roger',
            'last_name' => 'Rabbit',
            'reference' => '0004',
            'email' => 'tester2@robertmanager.net',
            'phone' => null,
            'street' => null,
            'postal_code' => null,
            'locality' => null,
            'country_id' => null,
            'note' => null,
        ]);
        $expected = [
            'reference' => '0004',
            'note' => null,
            'person' => [
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
                'email' => 'tester2@robertmanager.net',
                'phone' => null,
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => null,
            ],
        ];
        $this->assertEquals($expected, $result);

        // - Supprime les données liées à la personne qui ne sont pas attendues.
        $result = Beneficiary::unserialize([
            'first_name' => 'Roger',
            'last_name' => 'Rabbit',
            'reference' => '0004',
            'person_id' => 2,
            'person' => [
                'phone' => null,
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => null,
            ],
        ]);
        $expected = [
            'reference' => '0004',
            'person' => [
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
            ],
        ];
        $this->assertEquals($expected, $result);

        // - Cas ou les données de la personne sont manquantes.
        $result = Beneficiary::unserialize(['reference' => '0010']);
        $this->assertEquals(['reference' => '0010'], $result);

        // - Cas ou il n'y a pas de données.
        $this->assertEquals([], Beneficiary::unserialize([]));
    }

    public function testCreateWithoutData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Beneficiary::new([]);
    }

    public function testBadData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Beneficiary::new(['pseudo' => 'Sans email!']);
    }

    public function testBadDataDuplicateRef(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Beneficiary::new([
            'first_name' => 'Paul',
            'last_name' => 'Newtests',
            'email' => 'paul@tests.new',
            'reference' => '0005',
        ]);
    }

    public function testCreateWithoutPerson(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Beneficiary::new(['reference' => '0009']);
    }

    public function testCreate(): void
    {
        $data = [
            'note' => null,
            'person' => [
                'first_name' => 'José',
                'last_name' => 'Gatillon',
                'email' => 'test@other-benef.net',
                'phone' => null,
                'street' => null,
                'postal_code' => '74000',
                'locality' => 'Annecy',
                'country_id' => 2,
            ],
        ];

        $result = Beneficiary::new($data);
        $this->assertEquals(4, $result->id);
        $this->assertEquals(5, $result->person->id);
        $this->assertEquals('José', $result->person->first_name);
        $this->assertEquals('Gatillon', $result->person->last_name);
        $this->assertEquals('Annecy', $result->person->locality);
        $this->assertEquals('Suisse', $result->person->country->name);
    }

    public function testUpdateNotFound(): void
    {
        $this->expectException(ModelNotFoundException::class);
        Beneficiary::staticEdit(999, []);
    }

    public function testUpdate(): void
    {
        $result = Beneficiary::staticEdit(2, ['note' => "Très bon client."]);
        $this->assertEquals("Très bon client.", $result->note);

        // - Test update avec des données de "Person"
        $data = ['person' => ['first_name' => 'Jessica']];
        $result = Beneficiary::staticEdit(2, $data);
        $this->assertEquals('Jessica Rabbit', $result->person->full_name);
    }
}
