<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\Install as Install;

final class InstallTest extends ModelTestCase
{
    public function testGetNextInstallStep()
    {
        // - Get the next steps of install wizard steps
        $this->assertEquals('welcome', Install\Install::getNextInstallStep('_inexistant_'));
        $this->assertEquals('coreSettings', Install\Install::getNextInstallStep('welcome'));
        $this->assertEquals('settings', Install\Install::getNextInstallStep('coreSettings'));
        $this->assertEquals('company', Install\Install::getNextInstallStep('settings'));
        $this->assertEquals('database', Install\Install::getNextInstallStep('company'));
        $this->assertEquals('dbStructure', Install\Install::getNextInstallStep('database'));
        $this->assertEquals('adminUser', Install\Install::getNextInstallStep('dbStructure'));
        $this->assertEquals('categories', Install\Install::getNextInstallStep('adminUser'));
        $this->assertEquals('end', Install\Install::getNextInstallStep('categories'));
        $this->assertEquals('end', Install\Install::getNextInstallStep('end'));
    }
}
