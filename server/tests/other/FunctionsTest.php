<?php
declare(strict_types=1);

namespace Loxya\Tests;

final class FunctionsTest extends TestCase
{
    public function testGetExecutionTime(): void
    {
        $this->assertNotEmpty(getExecutionTime());
    }
}
