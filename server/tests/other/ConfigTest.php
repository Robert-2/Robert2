<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Config;
use Illuminate\Database\Capsule\Manager as Capsule;

final class ConfigTest extends ModelTestCase
{
    public function testGetSettings()
    {
        // - Test get all settings
        $result = Config\Config::getSettings();
        $this->assertEquals('mysql', $result['db']['driver']);

        // - Test get one setting
        $result = Config\Config::getSettings('db');
        $this->assertEquals('mysql', $result['driver']);

        // - Test get a single setting
        $this->assertEquals('Robert2', Config\Config::getSettings('basename'));
    }

    public function testGetDbConfig()
    {
        $result = Config\Config::getDbConfig();
        $this->assertCount(12, $result);
    }

    public function testGetCapsule()
    {
        $result = Config\Config::getCapsule();
        $this->assertInstanceOf(Capsule::class, $result);
    }
}
