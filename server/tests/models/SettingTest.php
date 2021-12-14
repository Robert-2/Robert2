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
            'eventSummary' => [
                'customText' => [
                    'title' => "Contrat",
                    'content' => "Un petit contrat de test.",
                ],
                'materialDisplayMode' => 'sub-categories',
                'withLegalNumbers' => true,
            ],
            'calendar' => [
                'event' => [
                    'showLocation' => true,
                    'showBorrower' => false,
                ],
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetAll(): void
    {
        $result = Setting::get()->toArray();
        $expected = [
            [
                'key' => 'eventSummary.materialDisplayMode',
                'value' => 'sub-categories',
            ],
            [
                'key' => 'eventSummary.customText.title',
                'value' => "Contrat",
            ],
            [
                'key' => 'eventSummary.customText.content',
                'value' => "Un petit contrat de test.",
            ],
            [
                'key' => 'eventSummary.withLegalNumbers',
                'value' => true,
            ],
            [
                'key' => 'calendar.event.showLocation',
                'value' => true,
            ],
            [
                'key' => 'calendar.event.showBorrower',
                'value' => false,
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetWithKey(): void
    {
        $result = Setting::getWithKey('eventSummary.materialDisplayMode');
        $this->assertEquals('sub-categories', $result);

        $result = Setting::getWithKey('eventSummary.customText.title');
        $this->assertEquals("Contrat", $result);

        $result = Setting::getWithKey('eventSummary.customText');
        $expected = ['title' => 'Contrat', 'content' => 'Un petit contrat de test.'];
        $this->assertEquals($expected, $result);

        $result = Setting::getWithKey('eventSummary');
        $expected = [
            'customText' => [
                'title' => 'Contrat',
                'content' => 'Un petit contrat de test.',
            ],
            'materialDisplayMode' => 'sub-categories',
            'withLegalNumbers' => true,
        ];
        $this->assertEquals($expected, $result);

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
        Setting::staticEdit(null, ['eventSummary.materialDisplayMode' => 'not-valid']);
    }

    public function testUpdate(): void
    {
        Setting::staticEdit(null, [
            'eventSummary.materialDisplayMode' => 'flat',
            'eventSummary.customText.title' => 'test',
            'eventSummary.customText.content' => null,
            'eventSummary.withLegalNumbers' => false,
            'calendar.event.showLocation' => false,
            'calendar.event.showBorrower' => true,
        ]);
        $expected = [
            'eventSummary' => [
                'customText' => [
                    'title' => 'test',
                    'content' => null,
                ],
                'materialDisplayMode' => 'flat',
                'withLegalNumbers' => false,
            ],
            'calendar' => [
                'event' => [
                    'showLocation' => false,
                    'showBorrower' => true,
                ],
            ],
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
