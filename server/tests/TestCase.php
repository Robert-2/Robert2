<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Support\Carbon;
use Adbar\Dot as DotArray;
use Robert2\API\Config\Config;
use Robert2\Fixtures\RobertFixtures;
use PHPUnit\Framework\TestCase as CoreTestCase;
use Spatie\Snapshots\MatchesSnapshots;

class TestCase extends CoreTestCase
{
    use MatchesSnapshots;

    protected function setUp(): void
    {
        parent::setUp();

        static::setCustomConfig();

        try {
            RobertFixtures::resetDataWithDump();
        } catch (\Exception $e) {
            $this->fail(sprintf("Unable to reset fixtures: %s", $e->getMessage()));
        }
    }

    protected function tearDown(): void
    {
        Config::deleteCustomConfig();

        if (Carbon::hasTestNow()) {
            Carbon::setTestNow(null);
        }

        parent::tearDown();
    }

    protected function getSnapshotDirectory(): string
    {
        return TESTS_SNAPSHOTS_FOLDER;
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected static function setCustomConfig(array $customValues = [])
    {
        $config = new DotArray([
            'apiUrl' => 'http://loxya.test',
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
            ],
            'billingMode' => 'partial',
            'degressiveRateFunction' => '((daysCount - 1) * 0.75) + 1',
            'maxItemsPerPage' => 100,
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
            'maxFileUploadSize' => 25 * 1024 * 1024,
        ]);

        $config = $config->set($customValues)->all();
        Config::saveCustomConfig($config);
    }

    // ------------------------------------------------------
    // -
    // -    Custom assertions
    // -
    // ------------------------------------------------------

    public function assertSameCanonicalize($expected, $actual, string $message = ''): void
    {
        $canonicalize = function (&$value) use (&$canonicalize) {
            if (is_array($value)) {
                ksort($value);
                foreach ($value as &$subValue) {
                    $canonicalize($subValue);
                }
            }
        };
        $canonicalize($expected);
        $canonicalize($actual);

        $this->assertSame($expected, $actual, $message);
    }

    public function assertNotSameCanonicalize($expected, $actual, string $message = ''): void
    {
        $canonicalize = function (&$value) use (&$canonicalize) {
            if (is_array($value)) {
                ksort($value);
                foreach ($value as &$subValue) {
                    $canonicalize($subValue);
                }
            }
        };
        $canonicalize($expected);
        $canonicalize($actual);

        $this->assertNotSame($expected, $actual, $message);
    }
}
