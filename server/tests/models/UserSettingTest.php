<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Models\User;
use Robert2\API\Models\UserSetting;

final class UserSettingTest extends TestCase
{
    public function testGetAll(): void
    {
        $this->expectException(\Exception::class);
        (new UserSetting())->getAll();
    }

    public function testEditByUserWithNewUser(): void
    {
        $this->expectException(ModelNotFoundException::class);
        UserSetting::editByUser(new User(), []);
    }

    public function testEditByUser(): void
    {
        $result = UserSetting::editByUser(User::find(1), [
            'language' => 'fr',
            'auth_token_validity_duration' => 133,
        ]);
        unset($result->created_at);
        unset($result->updated_at);

        $this->assertEquals([
            'id' => 1,
            'user_id' => 1,
            'language' => 'fr',
            'auth_token_validity_duration' => 133
        ], $result->toArray());
    }

    public function testRemove(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("User settings cannot be deleted.");
        UserSetting::staticRemove(1);
    }

    public function testUnremove(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("User settings cannot be restored.");
        UserSetting::staticUnremove(1);
    }
}
