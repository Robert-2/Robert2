<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class SettingsTest extends ApiTestCase
{
    public function testGetAll(): void
    {
        $this->client->get('/api/settings');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'eventSummary' => [
                'customText' => [
                    'title' => "Contrat",
                    'content' => "Un petit contrat de test.",
                ],
                'materialDisplayMode' => 'categories',
                'showLegalNumbers' => true,
            ],
            'calendar' => [
                'event' => [
                    'showBorrower' => false,
                    'showLocation' => true,
                ],
                'public' => [
                    'enabled' => true,
                    'url' => 'http://loxya.test/calendar/public/dfe7cd82-52b9-4c9b-aaed-033df210f23b.ics',
                ],
            ],
            'returnInventory' => [
                'mode' => 'start-empty',
            ],
        ]);
    }

    public function testUpdateBadKey(): void
    {
        $this->client->put('/api/settings', [
            'inexistant_settings' => 'some-value',
            'eventSummary.customText.title' => null,
        ]);
        $this->assertApiValidationError([
            'inexistant_settings' => ["This setting does not exists."],
        ]);
    }

    public function testUpdateBadValue(): void
    {
        $this->client->put('/api/settings', [
            'calendar.event.showBorrower' => 'foo',
            'eventSummary.materialDisplayMode' => 'not-valid',
            'eventSummary.customText.title' => str_repeat('A', 192),
            'calendar.public.uuid' => 'not-valid',
        ]);
        $this->assertApiValidationError([
            'calendar.event.showBorrower' => [
                'This field should be a boolean.',
            ],
            'eventSummary.materialDisplayMode' => [
                'One of the following rules must be verified:',
                'Must equal "categories".',
                'Must equal "sub-categories".',
                'Must equal "parks".',
                'Must equal "flat".',
            ],
            'eventSummary.customText.title' => [
                '191 max. characters.',
            ],
            'calendar.public.uuid' => [
                'This unique identifier (UUID) is invalid.',
            ],
        ]);
    }

    public function testUpdate(): void
    {
        $this->client->put('/api/settings', [
            'eventSummary' => [
                'customText' => [
                    'title' => 'foo',
                    'content' => 'bar',
                ],
                'materialDisplayMode' => 'categories',
                'showLegalNumbers' => true,
            ],
            'calendar' => [
                'event' => [
                    'showBorrower' => false,
                    'showLocation' => false,
                ],
                'public' => [
                    'enabled' => false,
                ],
            ],
            'returnInventory' => [
                'mode' => 'start-full',
            ],
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'eventSummary' => [
                'customText' => [
                    'title' => 'foo',
                    'content' => 'bar',
                ],
                'materialDisplayMode' => 'categories',
                'showLegalNumbers' => true,
            ],
            'calendar' => [
                'event' => [
                    'showBorrower' => false,
                    'showLocation' => false,
                ],
                'public' => [
                    'enabled' => false,
                ],
            ],
            'returnInventory' => [
                'mode' => 'start-full',
            ],
        ]);

        // - Syntaxe alternative
        $this->client->put('/api/settings', [
            'calendar.event.showBorrower' => true,
            'eventSummary.materialDisplayMode' => 'flat',
            'eventSummary.customText.title' => null,
            'eventSummary.customText.content' => null,
            'eventSummary.showLegalNumbers' => false,
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'eventSummary' => [
                'customText' => [
                    'title' => null,
                    'content' => null,
                ],
                'materialDisplayMode' => 'flat',
                'showLegalNumbers' => false,
            ],
            'calendar' => [
                'event' => [
                    'showBorrower' => true,
                    'showLocation' => false,
                ],
                'public' => [
                    'enabled' => false,
                ],
            ],
            'returnInventory' => [
                'mode' => 'start-full',
            ],
        ]);
    }

    public function testReset(): void
    {
        // - Par défaut, le mode d'affichage du matériel est `sub-categories`.
        $this->client->delete('/api/settings/eventSummary.materialDisplayMode');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseHasKeyEquals('eventSummary.materialDisplayMode', 'sub-categories');

        // - Par défaut, l'UUID de calendrier est un UUID aléatoire.
        $this->client->delete('/api/settings/calendar.public.url');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseHasKeyNotEquals(
            'calendar.public.url',
            'http://loxya.test/calendar/public/dfe7cd82-52b9-4c9b-aaed-033df210f23b.ics'
        );

        // - Par défaut, le calendrier public est désactivé.
        $this->client->delete('/api/settings/calendar.public.enabled');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseHasKeyEquals('calendar.public.enabled', false);
    }
}
