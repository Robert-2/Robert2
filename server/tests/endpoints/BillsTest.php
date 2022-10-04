<?php
namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Models\Bill;

final class BillsTest extends ApiTestCase
{
    public static function data(int $id)
    {
        return static::_dataFactory($id, [
            [
                'id' => 1,
                'number' => '2020-00001',
                'date' => '2020-01-30 14:00:00',
                'event_id' => 1,
                'beneficiary_id' => 3,
                'materials' => [
                    [
                        'id' => 1,
                        'name' => "Console Yamaha CL3",
                        'reference' => "PM5D",
                        'park_id' => 1,
                        'category_id' => 1,
                        'sub_category_id' => 1,
                        'rental_price' => 300.0,
                        'stock_quantity' => 5,
                        'out_of_order_quantity' => 1,
                        'replacement_price' => 19400.0,
                        'is_hidden_on_bill' => false,
                        'is_discountable' => false,
                    ],
                    [
                        'id' => 2,
                        'name' => "Processeur DBX PA2",
                        'reference' => "DBXPA2",
                        'park_id' => 1,
                        'category_id' => 1,
                        'sub_category_id' => 2,
                        'rental_price' => 25.5,
                        'stock_quantity' => 2,
                        'out_of_order_quantity' => null,
                        'replacement_price' => 349.9,
                        'is_hidden_on_bill' => false,
                        'is_discountable' => true,
                    ],
                ],
                'degressive_rate' => 1.75,
                'discount_rate' => 50,
                'vat_rate' => 0.2,
                'due_amount' => 325.5,
                'replacement_amount' => 325.5,
                'currency' => 'EUR',
                'user_id' => 1,
            ],
        ]);
    }

    public function testGetBill()
    {
        $this->client->get('/api/bills/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1));
    }

    public function testCreateBill()
    {
        $this->client->post('/api/events/2/bill');
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $newBillNumber = sprintf('%s-00001', date('Y'));
        $this->assertResponseData([
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
            'discount_rate' => 0,
            'vat_rate' => 20,
            'due_amount' => 1664.25,
            'replacement_amount' => 58899.8,
            'currency' => 'EUR',
            'user_id' => 1,
        ], ['date']);
    }

    public function testCreateBillWithDiscount()
    {
        $this->client->post('/api/events/2/bill', ['discountRate' => 50.0]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $newBillNumber = sprintf('%s-00001', date('Y'));
        $this->assertResponseData([
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
            'discount_rate' => 50,
            'vat_rate' => 20,
            'due_amount' => 1619.63,
            'replacement_amount' => 58899.8,
            'currency' => 'EUR',
            'user_id' => 1,
        ], ['date']);
    }

    public function testDeleteAndDestroyBill()
    {
        // - First call: soft delete.
        $this->client->delete('/api/bills/1');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $softDeleted = Bill::withTrashed()->find(1);
        $this->assertNotNull($softDeleted);
        $this->assertNotEmpty($softDeleted->deleted_at);

        // - Second call: actually DESTROY record from DB
        $this->client->delete('/api/bills/1');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertNull(Bill::withTrashed()->find(1));
    }

    public function testDownloadPdf()
    {
        // - Bill does not exists
        $this->client->get('/bills/999/pdf');
        $this->assertNotFound();

        // - Download bill n°1 PDF file
        $responseStream = $this->client->get('/bills/1/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot($responseStream->getContents());
    }
}
