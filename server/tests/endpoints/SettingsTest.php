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
                'materialDisplayMode' => 'sub-categories',
                'showLegalNumbers' => true,
            ],
            'calendar' => [
                'event' => [
                    'showBorrower' => false,
                    'showLocation' => true,
                ],
                'public' => [
                    'enabled' => true,
                    'uuid' => 'dfe7cd82-52b9-4c9b-aaed-033df210f23b',
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
            'key' => ["This setting does not exists."],
        ]);
    }

    public function testUpdateBadValue(): void
    {
        $this->client->put('/api/settings', [
            'calendar.event.showBorrower' => 'foo',
            'eventSummary.materialDisplayMode' => 'not-valid',
            'eventSummary.customText.title' => str_repeat('A', 192),
            'event.public.uuid' => 'not-valid',
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
            'event.public.uuid' => [
                'value must be a valid UUID',
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
                'materialDisplayMode' => 'sub-categories',
                'showLegalNumbers' => true,
            ],
            'calendar' => [
                'event' => [
                    'showBorrower' => false,
                    'showLocation' => false,
                ],
                'public' => [
                    'enabled' => false,
                    'uuid' => 'dfe7cd82-52b9-4c9b-aaed-033df210f23b',
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
                'materialDisplayMode' => 'sub-categories',
                'showLegalNumbers' => true,
            ],
            'calendar' => [
                'event' => [
                    'showBorrower' => false,
                    'showLocation' => false,
                ],
                'public' => [
                    'enabled' => false,
                    'uuid' => 'dfe7cd82-52b9-4c9b-aaed-033df210f23b',
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
                    'uuid' => 'dfe7cd82-52b9-4c9b-aaed-033df210f23b',
                ],
            ],
        ]);
    }
}
