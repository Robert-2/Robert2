<?php
namespace Robert2\Tests;

final class SettingsTest extends ApiTestCase
{
    public function testGetAll()
    {
        $this->client->get('/api/settings');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'event_summary_material_display_mode' => 'sub-categories',
            'event_summary_custom_text_title' => "Contrat",
            'event_summary_custom_text' => "Un petit contrat de test.",
        ]);
    }

    public function testUpdateBadKey(): void
    {
        $this->client->put('/api/settings', [
            'inexistant_settings' => 'some-value',
            'event_summary_custom_text_title' => null,
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'key' => [
                "This setting does not exists.",
            ],
        ]);
    }

    public function testUpdateBadValue(): void
    {
        $this->client->put('/api/settings', [
            'event_summary_material_display_mode' => 'not-valid',
            'event_summary_custom_text_title' => str_repeat('A', 192),
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'event_summary_material_display_mode' => [
                'At least one of these rules must pass for value',
                'value must be equals "categories"',
                'value must be equals "sub-categories"',
                'value must be equals "parks"',
                'value must be equals "flat"',
            ],
            'event_summary_custom_text_title' => [
                'value must have a length lower than 191',
            ],
        ]);
    }

    public function testUpdate(): void
    {
        $this->client->put('/api/settings', [
            'event_summary_material_display_mode' => 'flat',
            'event_summary_custom_text_title' => null,
            'event_summary_custom_text' => null,
        ]);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'event_summary_material_display_mode' => 'flat',
            'event_summary_custom_text_title' => null,
            'event_summary_custom_text' => null,
        ]);
    }
}
