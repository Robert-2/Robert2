<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Carbon\Carbon;
use Robert2\API\Config\Config;
use Robert2\Fixtures\RobertFixtures;
use PHPUnit\Framework\TestCase as CoreTestCase;
use Spatie\Snapshots\MatchesSnapshots;

class TestCase extends CoreTestCase
{
    use MatchesSnapshots;

    protected $settings = [];
    protected $Fixtures = null;

    protected function setUp(): void
    {
        parent::setUp();

        $this->_initSettings();

        try {
            RobertFixtures::resetDataWithDump();
        } catch (\Exception $e) {
            $this->fail(sprintf("Unable to reset fixtures: %s", $e->getMessage()));
        }
    }

    protected function tearDown(): void
    {
        $this->_restoreLocalSettings();

        if (Carbon::hasTestNow()) {
            Carbon::setTestNow(null);
        }

        parent::tearDown();
    }

    protected function getSnapshotDirectory(): string
    {
        return SNAPSHOTS_FOLDER;
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _initSettings()
    {
        $localSettings = Config::getSettings();

        if (!isset($localSettings['db']['testDatabase'])) {
            $localSettings['db']['testDatabase'] = 'robert2_test';
        }

        $this->settings = [
            'apiUrl' => $localSettings['apiUrl'],
            'basename' => 'Robert2',
            'enableCORS' => true,
            'displayErrorDetails' => true,
            'useRouterCache' => false,
            'useHTTPS' => false,
            'sessionExpireHours' => 12,
            'JWTSecret' => 'jwt_secret_for_tests',
            'httpAuthHeader' => 'Authorization',
            'defaultLang' => 'fr',
            'currency' => [
                'symbol' => '€',
                'name' => 'Euro',
                'iso' => 'EUR',
                'symbol_intl' => '€',
                'decimal_digits' => 2,
                'rounding' => 0
            ],
            'billingMode' => 'partial',
            'degressiveRateFunction' => '((daysCount - 1) * 0.75) + 1',
            'maxItemsPerPage' => 100,
            'db' => $localSettings['db'],
            'companyData' => [
                'name' => 'Testing corp.',
                'street' => '5 rue des tests',
                'zipCode' => '05555',
                'locality' => 'Testville',
                'country' => 'France',
                'phone' => '+33123456789',
                'email' => 'jean@testing-corp.dev',
                'vatNumber' => 'FR11223344556600',
                'vatRate' => 20.0,
                'legalNumbers' => [
                    ['name' => 'SIRET', 'value' => '543 210 080 20145'],
                    ['name' => 'APE', 'value' => '947A'],
                ],
            ],
            'email' => [
                'from' => 'testing@loxya.com',
            ],
            'maxFileUploadSize' => 25 * 1024 * 1024,
        ];

        $this->_setTestSettings();
    }

    protected function _setTestSettings()
    {
        $localSettingsFile = Config::SETTINGS_FILE;
        $testsSettingsContent = json_encode($this->settings, JSON_PRETTY_PRINT);

        copy($localSettingsFile, $localSettingsFile . '.bckp');
        file_put_contents($localSettingsFile, $testsSettingsContent);
    }

    protected function _restoreLocalSettings()
    {
        $localSettingsFile = Config::SETTINGS_FILE;

        copy($localSettingsFile . '.bckp', $localSettingsFile);
        unlink($localSettingsFile . '.bckp');
    }
}
