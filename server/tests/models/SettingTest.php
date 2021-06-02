<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Models\Setting;
use Robert2\API\Errors\ValidationException;

final class SettingTest extends ModelTestCase
{
    public function testTableName(): void
    {
        $model = new Setting();
        $this->assertEquals('settings', $model->getTable());
    }

    public function testGetList(): void
    {
        $result = Setting::getList();
        $this->assertEquals([
            'id' => 1,
            'event_summary_material_display_mode' => 'sub-categories',
            'event_summary_custom_text_title' => "Contrat",
            'event_summary_custom_text' => "Un petit contrat de test.",
            'created_at' => null,
            'updated_at' => null,
        ], $result);
    }

    public function testGetCurrent(): void
    {
        $result = Setting::getCurrent('event_summary_material_display_mode');
        $this->assertEquals('sub-categories', $result);

        $result = Setting::getCurrent('event_summary_custom_text_title');
        $this->assertEquals("Contrat", $result);

        $result = Setting::getCurrent('event_summary_custom_text');
        $this->assertEquals("Un petit contrat de test.", $result);

        $result = Setting::getCurrent('inexistant');
        $this->assertNull($result);
    }

    public function testCreate(): void
    {
        $this->expectException(ModelNotFoundException::class);
        Setting::staticEdit(null, []);
    }

    public function testUpdateBadData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Setting::staticEdit(1, ['event_summary_material_display_mode' => 'not-valid']);
    }

    public function testUpdate(): void
    {
        $result = Setting::staticEdit(1, [
            'event_summary_material_display_mode' => 'flat',
            'event_summary_custom_text' => null,
        ]);
        unset($result->created_at);
        unset($result->updated_at);
        $expected = [
            'id' => 1,
            'event_summary_material_display_mode' => 'flat',
            'event_summary_custom_text_title' => 'Contrat',
            'event_summary_custom_text' => null,
        ];
        $this->assertEquals($expected, $result->toArray());
    }

    public function testRemove(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Settings cannot be deleted.");
        Setting::staticRemove(1);
    }

    public function testUnremove(): void
    {
        $result = Setting::staticUnremove(1);
        $expected = [
            'id' => 1,
            'event_summary_material_display_mode' => 'sub-categories',
            'event_summary_custom_text_title' => "Contrat",
            'event_summary_custom_text' => "Un petit contrat de test.",
            'created_at' => null,
            'updated_at' => null,
        ];
        $this->assertEquals($expected, $result->toArray());
    }
}
