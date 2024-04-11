<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Illuminate\Support\Carbon;
use Adbar\Dot as DotArray;
use Loxya\Config\Config;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Tests\Fixtures\Fixtures;
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
            Fixtures::resetDataWithDump();
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

    protected static function setCustomConfig(array $customValues = []): void
    {
        $config = new DotArray([
            'baseUrl' => 'http://loxya.test',
            'enableCORS' => true,
            'displayErrorDetails' => true,
            'useRouterCache' => false,
            'sessionExpireHours' => 12,
            'healthcheck' => true,
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
            'maxConcurrentFetches' => 2,
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

    public function assertException($expectedException, callable $executor): void
    {
        $actualException = null;
        try {
            $executor();
        } catch (\Throwable $e) {
            $actualException = $e;
        }

        if ($expectedException instanceof \Throwable) {
            $this->assertInstanceOf(get_class($expectedException), $actualException);
            $this->assertSame($expectedException->getMessage(), $actualException->getMessage());
            $this->assertSame($expectedException->getCode(), $actualException->getCode());

            if ($expectedException instanceof ValidationException) {
                /** @var ValidationException $actualException */
                $this->assertSameCanonicalize(
                    $expectedException->getValidationErrors(),
                    $actualException->getValidationErrors(),
                );
            }
        }

        if (is_string($expectedException)) {
            if (class_exists($expectedException)) {
                $this->assertInstanceOf($expectedException, $actualException);
            } else {
                $this->assertStringContainsString($expectedException, $actualException->getMessage());
            }
        }

        if (is_int($expectedException)) {
            $this->assertSame($expectedException, $actualException->getCode());
        }
    }

    public function assertSameCanonicalize($expected, $actual, string $message = ''): void
    {
        $canonicalize = function (&$value) use (&$canonicalize): void {
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
        $canonicalize = function (&$value) use (&$canonicalize): void {
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
