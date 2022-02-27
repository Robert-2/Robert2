<?php
namespace Robert2\Tests;

final class SettingsTest extends ApiTestCase
{
    public function testGetAll()
    {
        $this->client->get('/api/settings');
        $this->assertStatusCode(SUCCESS_OK);
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
                    'url' => '/calendar/public/dfe7cd82-52b9-4c9b-aaed-033df210f23b.ics',
                ],
            ],
        ]);
    }

    public function testUpdateBadKey(): void
    {
        $this->client->put('/api/settings', [
            'inexistant_settings' => 'some-value',
            'eventSummary.customText.title' => null,
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
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
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'calendar.event.showBorrower' => [
                'value must be a boolean value',
            ],
            'eventSummary.materialDisplayMode' => [
                'At least one of these rules must pass for value',
                'value must be equals "categories"',
                'value must be equals "sub-categories"',
                'value must be equals "parks"',
                'value must be equals "flat"',
            ],
            'eventSummary.customText.title' => [
                'value must have a length lower than 191',
            ],
            'calendar.public.uuid' => [
                'The unique identifier (UUID) is invalid.',
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
        ]);
        $this->assertStatusCode(SUCCESS_OK);
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
        ]);

        // - Syntaxe alternative
        $this->client->put('/api/settings', [
            'calendar.event.showBorrower' => true,
            'eventSummary.materialDisplayMode' => 'flat',
            'eventSummary.customText.title' => null,
            'eventSummary.customText.content' => null,
            'eventSummary.showLegalNumbers' => false,
        ]);
        $this->assertStatusCode(SUCCESS_OK);
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
        ]);
    }

    public function testReset(): void
    {
        // - Par défaut, le mode d'affichage du matériel est `sub-categories`.
        $this->client->delete('/api/settings/eventSummary.materialDisplayMode');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseHasKeyEquals('eventSummary.materialDisplayMode', 'sub-categories');

        // - Par défaut, l'UUID de calendrier est un UUID aléatoire.
        $this->client->delete('/api/settings/calendar.public.url');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseHasKeyNotEquals(
            'calendar.public.url',
            '/calendar/public/dfe7cd82-52b9-4c9b-aaed-033df210f23b.ics'
        );

        // - Par défaut, le calendrier public est désactivé.
        $this->client->delete('/api/settings/calendar.public.enabled');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseHasKeyEquals('calendar.public.enabled', false);
    }
}
