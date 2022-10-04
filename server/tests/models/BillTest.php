<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Models\Bill;

final class BillTest extends TestCase
{
    public function testCreateFromEventNotFound()
    {
        $this->expectException(ModelNotFoundException::class);
        Bill::createFromEvent(999, 1, 25);
    }

    public function testCreateFromEvent()
    {
        $result = Bill::createFromEvent(2, 1, 25.9542);
        $newBillNumber = sprintf('%s-00001', date('Y'));
        $expected = [
            'id' => 2,
            'number' => $newBillNumber,
            'date' => '__FAKE_TEST_PLACEHOLDER__',
            'event_id' => 2,
            'beneficiary_id' => 3,
            'materials' => [
                [
                    'id' => 2,
                    'name' => 'Processeur DBX PA2',
                    'reference' => 'DBXPA2',
                    'park_id' => 1,
                    'category_id' => 1,
                    'sub_category_id' => 2,
                    'rental_price' => 25.5,
                    'replacement_price' => 349.9,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'quantity' => 2,
                ],
                [
                    'id' => 1,
                    'name' => 'Console Yamaha CL3',
                    'reference' => 'CL3',
                    'park_id' => 1,
                    'category_id' => 1,
                    'sub_category_id' => 1,
                    'rental_price' => 300,
                    'replacement_price' => 19400,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => false,
                    'quantity' => 3
                ],
            ],
            'degressive_rate' => 1.75,
            'discount_rate' => 25.9542,
            'vat_rate' => 20.0,
            'due_amount' => 1641.09,
            'replacement_amount' => 58899.8,
            'currency' => 'EUR',
            'user_id' => 1,
            'created_at' => '__FAKE_TEST_PLACEHOLDER__',
            'updated_at' => '__FAKE_TEST_PLACEHOLDER__',
        ];
        $safeResult = $result->toArray();
        foreach (['date', 'created_at', 'updated_at'] as $field) {
            $safeResult[$field] = '__FAKE_TEST_PLACEHOLDER__';
        }
        $this->assertEquals($expected, $safeResult);
    }

    public function testGetPdfName()
    {
        $result = (new Bill)->getPdfName(1);
        $expected = 'TEST-Facture-Testing_corp.-2020-00001-Client_Benef.pdf';
        $this->assertEquals($expected, $result);
    }

    public function testGetPdfContent()
    {
        $result = (new Bill)->getPdfContent(1);
        $this->assertMatchesHtmlSnapshot($result);
    }

    public function testDeleteByNumber()
    {
        // - Bill does not exists, nothing happens
        Bill::deleteByNumber('_inexistant_');
        $this->assertNotNull(Bill::find(1));

        // - Permanently deletes bill ID n°1
        Bill::deleteByNumber('2020-00001');
        $this->assertNull(Bill::find(1));
    }

    public function testGetLastNumber()
    {
        $result = Bill::getLastNumber(2099);
        $this->assertEquals(null, $result);

        $result = Bill::getLastNumber(2020);
        $this->assertEquals('2020-00001', $result);
    }

    public function testGetNextNumber()
    {
        $result = Bill::getNextNumber(2099);
        $this->assertEquals('2099-00001', $result);

        $result = Bill::getNextNumber(2020);
        $this->assertEquals('2020-00002', $result);
    }
}
