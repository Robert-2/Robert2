<?php
declare(strict_types=1);

namespace Loxya\Tests;

final class FunctionsTest extends TestCase
{
    public function testGetExecutionTime(): void
    {
        $this->assertNotEmpty(getExecutionTime());
    }

    public function testIncreaseMemory(): void
    {
        $defaultMemoryLimit = ini_get('memory_limit');

        foreach (['256M', '512M', '488M', '1G'] as $limit) {
            $result = increaseMemory($limit, static fn () => ini_get('memory_limit'));
            $this->assertSame($limit, $result);
        }

        $this->assertSame($defaultMemoryLimit, ini_get('memory_limit'));
    }
}
