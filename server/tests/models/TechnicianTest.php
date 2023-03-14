<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Errors\Exception\ValidationException;
use Robert2\API\Models\Technician;

final class TechnicianTest extends TestCase
{
    public function testSetSearch(): void
    {
        // - Prénom
        $result = (new Technician)->setSearch('ro')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Roger Rabbit'], $result->pluck('full_name')->all());

        // - Prénom nom
        $result = (new Technician)->setSearch('jean tec')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Technicien'], $result->pluck('full_name')->all());

        // - Nom Prénom
        $result = (new Technician)->setSearch('technicien jean')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Technicien'], $result->pluck('full_name')->all());

        // - Email
        $result = (new Technician)->setSearch('client@technicien.com')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Technicien'], $result->pluck('full_name')->all());

        // - Nickname
        $result = (new Technician)->setSearch('Riri')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Roger Rabbit'], $result->pluck('full_name')->all());
    }

    public function testUnserialize(): void
    {
        $result = Technician::unserialize([
            'first_name' => 'Roger',
            'last_name' => 'Rabbit',
            'nickname' => 'Riri',
            'email' => 'tester2@robertmanager.net',
            'phone' => null,
            'street' => null,
            'postal_code' => null,
            'locality' => null,
            'country_id' => null,
            'note' => null,
        ]);
        $expected = [
            'nickname' => 'Riri',
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
        $result = Technician::unserialize([
            'first_name' => 'Roger',
            'last_name' => 'Rabbit',
            'nickname' => 'Riri',
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
            'nickname' => 'Riri',
            'person' => [
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
            ],
        ];
        $this->assertEquals($expected, $result);

        // - Cas ou les données de la personne sont manquantes.
        $result = Technician::unserialize(['nickname' => 'Polo']);
        $this->assertEquals(['nickname' => 'Polo'], $result);

        // - Cas ou il n'y a pas de données.
        $this->assertEquals([], Technician::unserialize([]));
    }

    public function testCreateWithoutData(): void
    {
        $this->expectException(ValidationException::class);
        Technician::new([]);
    }

    public function testCreateBadData(): void
    {
        $this->expectException(ValidationException::class);
        Technician::new(['pseudo' => 'Sans email!']);
    }

    public function testCreateWithoutPerson(): void
    {
        $this->expectException(ValidationException::class);
        Technician::new(['nickname' => 'Gégé']);
    }

    public function testCreate(): void
    {
        $data = [
            'nickname' => 'Gégé',
            'note' => null,
            'person' => [
                'first_name' => 'José',
                'last_name' => 'Gatillon',
                'email' => 'test@other-tech.net',
                'phone' => null,
                'street' => null,
                'postal_code' => '74000',
                'locality' => 'Annecy',
                'country_id' => 2,
            ],
        ];

        $result = Technician::new($data);
        $this->assertEquals(3, $result->id);
        $this->assertEquals('Gégé', $result->nickname);
        $this->assertEquals(8, $result->person->id);
        $this->assertEquals('José', $result->person->first_name);
        $this->assertEquals('Gatillon', $result->person->last_name);
        $this->assertEquals('Annecy', $result->person->locality);
        $this->assertEquals('Suisse', $result->person->country->name);
    }

    public function testUpdateNotFound(): void
    {
        $this->expectException(ModelNotFoundException::class);
        Technician::staticEdit(999, []);
    }

    public function testUpdate(): void
    {
        $result = Technician::staticEdit(2, ['note' => "Ne pas déranger le week-end."]);
        $this->assertEquals("Ne pas déranger le week-end.", $result->note);

        // - Test update avec des données de "Person"
        $data = ['person' => ['first_name' => 'Jessica']];
        $result = Technician::staticEdit(1, $data);
        $this->assertEquals('Jessica Rabbit', $result->person->full_name);
    }
}
