<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\Person;

final class PersonTest extends TestCase
{
    public function testValidation(): void
    {
        // - Avec un nom / prénom alambiqué, mais valide.
        $data = [
            'first_name' => 'Joséphine 1ère',
            'last_name' => 'De Latour-Dupin',
        ];
        $this->assertTrue((new Person($data))->isValid());

        // - Si le nom et/ou prénom contiennent des caractères invalides...
        $person = new Person([
            'first_name' => 'xav1er-7e$t',
            'last_name' => 'fo#32;reux',
        ]);
        $expectedErrors = [
            'first_name' => ['Ce champ contient des caractères non autorisés'],
            'last_name' => ['Ce champ contient des caractères non autorisés'],
        ];
        $this->assertFalse($person->isValid());
        $this->assertSame($expectedErrors, $person->validationErrors());
    }

    public function testSearch(): void
    {
        $result = Person::search('Jean')->get();
        $this->assertEquals(2, $result->count());
        $this->assertEquals(
            ['Jean Fountain', 'Jean Technicien'],
            $result->pluck('full_name')->all()
        );

        $result = Person::search('Fount')->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Fountain'], $result->pluck('full_name')->all());

        $result = Person::search('Jean F')->get();
        $this->assertEquals(1, $result->count());
        $this->assertEquals(['Jean Fountain'], $result->pluck('full_name')->all());

        $result = Person::search('Technicien Jean')->get();
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
