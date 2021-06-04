<?php
declare(strict_types=1);

namespace Robert2\Tests;

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
        $expected = [
            'event_summary_material_display_mode' => 'sub-categories',
            'event_summary_custom_text_title' => "Contrat",
            'event_summary_custom_text' => "Un petit contrat de test.",
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetAll(): void
    {
        $result = Setting::get()->toArray();
        $expected = [
            [
                'key' => 'event_summary_material_display_mode',
                'value' => 'sub-categories',
            ],
            [
                'key' => 'event_summary_custom_text_title',
                'value' => "Contrat",
            ],
            [
                'key' => 'event_summary_custom_text',
                'value' => "Un petit contrat de test.",
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetWithKey(): void
    {
        $result = Setting::getWithKey('event_summary_material_display_mode');
        $this->assertEquals('sub-categories', $result);

        $result = Setting::getWithKey('event_summary_custom_text_title');
        $this->assertEquals("Contrat", $result);

        $result = Setting::getWithKey('event_summary_custom_text');
        $this->assertEquals("Un petit contrat de test.", $result);

        $result = Setting::getWithKey('inexistant');
        $this->assertNull($result);
    }

    public function testUpdateBadKey(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Setting::staticEdit(null, ['inexistant' => 'some-text']);
    }

    public function testUpdateBadValue(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Setting::staticEdit(null, ['event_summary_material_display_mode' => 'not-valid']);
    }

    public function testUpdate(): void
    {
        Setting::staticEdit(null, [
            'event_summary_material_display_mode' => 'flat',
            'event_summary_custom_text_title' => 'test',
            'event_summary_custom_text' => null,
        ]);
        $expected = [
            'event_summary_material_display_mode' => 'flat',
            'event_summary_custom_text_title' => 'test',
            'event_summary_custom_text' => null,
        ];
        $this->assertEquals($expected, Setting::getList());
    }

    public function testRemove(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Settings cannot be deleted.");
        Setting::staticRemove(1);
    }

    public function testUnremove(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Settings cannot be restored.");
        Setting::staticUnremove(1);
    }
}
