<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Park;

final class ParkTest extends TestCase
{
    public function testGetTotalItems(): void
    {
        $Park = Park::find(1);
        $this->assertEquals(6, $Park->total_items);

        $Park = Park::find(2);
        $this->assertEquals(2, $Park->total_items);
    }

    public function testGetTotalAmount(): void
    {
        $Park = Park::find(1);
        $this->assertEquals(101223.8, $Park->total_amount);

        $Park = Park::find(2);
        $this->assertEquals(40500.0, $Park->total_amount);
    }

    public function testRemoveNotEmptyPark(): void
    {
        $this->expectException(\LogicException::class);
        Park::staticRemove(1);
    }

    public function testRemoveEmptyPark(): void
    {
        $newPark = Park::create(['name' => 'Vide et éphémère']);
        $result = Park::staticRemove($newPark->id);
        $this->assertNotEmpty($result->deleted_at);
    }

    public function testCreateParkDuplicate(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Park::new(['name' => 'default']);
    }
}
