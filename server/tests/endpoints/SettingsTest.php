<?php
namespace Robert2\Tests;

final class SettingsTest extends ApiTestCase
{
    public function testGetAll()
    {
        $this->client->get('/api/settings');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'event_summary_material_display_mode' => 'sub-categories',
            'event_summary_custom_text_title' => "Contrat",
            'event_summary_custom_text' => "Un petit contrat de test.",
            'created_at' => null,
            'updated_at' => null,
        ]);
    }

    public function testUpdateBadData(): void
    {
        $this->client->put('/api/settings', [
            'event_summary_material_display_mode' => 'not-valid',
            'event_summary_custom_text_title' => null,
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'event_summary_material_display_mode' => [
                "At least one of these rules must pass for event_summary_material_display_mode",
                'event_summary_material_display_mode must be equals "sub-categories"',
                'event_summary_material_display_mode must be equals "parks"',
                'event_summary_material_display_mode must be equals "flat"',
            ]
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
            'id' => 1,
            'event_summary_material_display_mode' => 'flat',
            'event_summary_custom_text_title' => null,
            'event_summary_custom_text' => null,
            'created_at' => null,
            'updated_at' => 'fakedTestContent',
        ], ['updated_at']);
    }
}
