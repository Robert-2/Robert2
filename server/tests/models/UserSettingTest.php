<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Models;

final class UserSettingTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\UserSetting();
    }

    public function testTableName(): void
    {
        $this->assertEquals('user_settings', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionCode(ERROR_NOT_ALLOWED);
        $this->model->getAll();
    }

    public function testEditNoUserId(): void
    {
        $this->expectException(ModelNotFoundException::class);
        $this->expectExceptionCode(ERROR_NOT_FOUND);
        $this->model->edit(null, []);
    }

    public function testEditNotFound(): void
    {
        $this->expectException(ModelNotFoundException::class);
        $this->expectExceptionCode(ERROR_NOT_FOUND);
        $this->model->edit(999, []);
    }

    public function testEdit(): void
    {
        $result = $this->model->edit(1, [
            'language'                     => 'FR',
            'auth_token_validity_duration' => 133,
        ]);
        unset($result->created_at);
        unset($result->updated_at);

        $this->assertEquals([
            'id'                           => 1,
            'user_id'                      => 1,
            'language'                     => 'FR',
            'auth_token_validity_duration' => 133
        ], $result->toArray());
    }

    public function testRemove(): void
    {
        $this->assertNull($this->model->remove(1));
    }
}
