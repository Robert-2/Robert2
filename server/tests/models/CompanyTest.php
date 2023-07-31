<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\Company;

final class CompanyTest extends TestCase
{
    public function testSearch(): void
    {
        // - Search a company legal name
        $results = Company::search('testin')->get();
        $this->assertCount(1, $results);
        $this->assertEquals(['Testing, Inc'], $results->pluck('legal_name')->all());
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
