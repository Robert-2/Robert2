<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models\Company;

final class CompanyTest extends TestCase
{
    public function testSetSearch(): void
    {
        // - Empty search
        $results = (new Company)->setSearch()->getAll()->get();
        $this->assertCount(2, $results);

        // - Search a company legal name
        $results = (new Company)->setSearch('testin')->getAll()->get();
        $this->assertCount(1, $results);
        $this->assertEquals(['Testing, Inc'], $results->pluck('legal_name')->all());

        // - Search with not allowed field
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Search field \"postal_code\" not allowed.");
        (new Company)->setSearch('1234', 'postal_code');
    }

    public function testCreateCompanyNormalizePhone(): void
    {
        $resultCompany = Company::new([
            'legal_name' => 'Test Company',
            'phone' => '+00336 25 25 21 25',
        ]);
        $this->assertEquals('+0033625252125', $resultCompany->phone);
    }
}
