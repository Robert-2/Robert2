<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\Role;
use Loxya\Support\Arr;

final class RoleTest extends TestCase
{
    public function testValidation(): void
    {
        $generateRole = static function (array $data = []): Role {
            $data = Arr::defaults($data, [
                'name' => "Testeur",
            ]);
            return new Role($data);
        };

        // - Avec des données valides.
        $this->assertTrue($generateRole()->isValid());

        // - Avec un nom manquant.
        $role = $generateRole(['name' => '']);
        $this->assertFalse($role->isValid());
        $this->assertSame(
            ['name' => "Ce champ est obligatoire."],
            $role->validationErrors(),
        );

        // - Avec un nom trop court.
        $role = $generateRole(['name' => 't']);
        $this->assertFalse($role->isValid());
        $this->assertSame(
            ['name' => "2 caractères min., 191 caractères max."],
            $role->validationErrors(),
        );

        // - Avec un nom qui existe déjà.
        $role = $generateRole(['name' => 'Régisseur']);
        $this->assertFalse($role->isValid());
        $this->assertSame(
            ['name' => "Ce rôle existe déjà."],
            $role->validationErrors(),
        );
    }
}
