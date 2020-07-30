<?php
declare(strict_types=1);

namespace Robert2\Tests;

use PHPUnit\Framework\TestCase;

final class FunctionsTest extends TestCase
{
    public function testIsTestMode(): void
    {
        $this->assertTrue(isTestMode());
    }

    public function testGetExecutionTime(): void
    {
        $this->assertNotEmpty(getExecutionTime());
    }

    public function testSnakeToCamelCase(): void
    {
        $this->assertEquals('unTest', snakeToCamelCase('un_test'));
        $this->assertEquals('SecondTest', snakeToCamelCase('second_test', true));
    }

    public function testSlugify(): void
    {
        $this->assertEquals('un_test', slugify("un test"));
        $this->assertEquals('test_espace_insécable', slugify("test espace insécable"));
    }

    public function testCleanEmptyFields()
    {
        $data = ['field1' => 'not-empty', 'field2' => '', 'field3' => null];
        $result = cleanEmptyFields($data);
        $expected = ['field1' => 'not-empty', 'field2' => null, 'field3' => null];
        $this->assertEquals($expected, $result);
    }
}
