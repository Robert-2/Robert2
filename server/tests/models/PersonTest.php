<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models\Person;

final class PersonTest extends TestCase
{
    public function testSetSearch(): void
    {
        $result = (new Person)->setSearch('Jean')->getAll()->get();
        $this->assertEquals(2, $result->count());
        $this->assertEquals(
            ['Jean Fountain', 'Jean Technicien'],
            $result->pluck('full_name')->all()
        );

        $result = (new Person)->setSearch('Fount')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Fountain'], $result->pluck('full_name')->all());

        $result = (new Person)->setSearch('Jean F')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Fountain'], $result->pluck('full_name')->all());

        $result = (new Person)->setSearch('Technicien Jean')->getAll()->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Technicien'], $result->pluck('full_name')->all());
    }

    public function testEditNormalizePhone(): void
    {
        $resultPerson = Person::staticEdit(1, [
            'phone' => '+00336 25 25 21 25',
        ]);
        $this->assertEquals('+0033625252125', $resultPerson->phone);
    }
}
