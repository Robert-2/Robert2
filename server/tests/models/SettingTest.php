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
        // - Si non spécifiée (ou `withSensitive = true`), les données sensibles doivent être présentes.
        $result = Setting::getList();
        $expected = [
            'eventSummary' => [
                'customText' => [
                    'title' => "Contrat",
                    'content' => "Un petit contrat de test.",
                ],
                'materialDisplayMode' => 'sub-categories',
                'showLegalNumbers' => true,
            ],
            'calendar' => [
                'event' => [
                    'showLocation' => true,
                    'showBorrower' => false,
                ],
                'public' => [
                    'enabled' => true,
                    'uuid' => 'dfe7cd82-52b9-4c9b-aaed-033df210f23b',
                ],
            ],
        ];
        $this->assertEquals($expected, $result);

        // - Si `withSensitive = false`, les données sensibles ne sont pas retournées.
        $result = Setting::getList(true);
        $expected = [
            'eventSummary' => [
                'customText' => [
                    'title' => "Contrat",
                    'content' => "Un petit contrat de test.",
                ],
                'materialDisplayMode' => 'sub-categories',
                'showLegalNumbers' => true,
            ],
            'calendar' => [
                'event' => [
                    'showLocation' => true,
                    'showBorrower' => false,
                ],
                'public' => [
                    'enabled' => true,
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
                'key' => 'eventSummary.showLegalNumbers',
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
            [
                'key' => 'calendar.public.enabled',
                'value' => true,
            ],
            [
                'key' => 'calendar.event.uuid',
                'value' => 'dfe7cd82-52b9-4c9b-aaed-033df210f23b',
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
            'showLegalNumbers' => true,
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
            'eventSummary.showLegalNumbers' => false,
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
                'showLegalNumbers' => false,
            ],
            'calendar' => [
                'event' => [
                    'showLocation' => false,
                    'showBorrower' => true,
                ],
                'public' => [
                    'enabled' => true,
                    'uuid' => 'dfe7cd82-52b9-4c9b-aaed-033df210f23b',
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
