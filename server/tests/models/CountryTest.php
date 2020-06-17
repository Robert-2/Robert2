<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models;

final class CountryTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Country();
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(3, $result);
    }
}
