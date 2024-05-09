<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Park;

final class ParkTest extends TestCase
{
    public function testGetTotalItems(): void
    {
        $park = Park::findOrFail(1);
        $this->assertEquals(7, $park->total_items);
    }

    public function testGetTotalAmount(): void
    {
        $park = Park::findOrFail(1);
        $this->assertEquals(11_9480.80, $park->total_amount);
    }

    public function testRemoveNotEmptyPark(): void
    {
        $this->expectException(\LogicException::class);
        Park::findOrFail(1)->delete();
    }

    public function testRemoveEmptyPark(): void
    {
        $newPark = Park::create(['name' => 'Vide et éphémère']);
        $isDeleted = Park::findOrFail($newPark->id)->delete();
        $this->assertTrue($isDeleted);
        $this->assertNull(Park::find($newPark->id));
    }

    public function testCreateParkDuplicate(): void
    {
        $this->expectException(ValidationException::class);
        Park::new(['name' => 'default']);
    }
}
