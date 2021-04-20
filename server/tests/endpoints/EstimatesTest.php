<?php
namespace Robert2\Tests;

final class EstimatesTest extends ApiTestCase
{
    public function testGetEstimate()
    {
        $this->client->get('/api/estimates/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'date' => '2021-01-30 14:00:00',
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
            'created_at' => '2021-01-30 14:00:00',
            'updated_at' => '2021-01-30 14:00:00',
            'deleted_at' => null,
        ]);
    }

    public function testCreateEstimate()
    {
        $this->client->post('/api/events/2/estimate');
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 2,
            'date' => 'fakedTestContent',
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
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
        ], ['date', 'created_at', 'updated_at']);
    }

    public function testCreateEstimateWithDiscount()
    {
        $this->client->post('/api/events/2/estimate', ['discountRate' => 50.0]);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 2,
            'date' => 'fakedTestContent',
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
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
        ], ['date', 'created_at', 'updated_at']);
    }

    public function testDeleteAndDestroyEstimate()
    {
        // - First call: sets `deleted_at` not null
        $this->client->delete('/api/estimates/1');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['deleted_at']);

        // - Second call: actually DESTROY record from DB
        $this->client->delete('/api/estimates/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testDownloadPdf()
    {
        // - Estimate does not exists
        $this->client->get('/estimates/999/pdf');
        $this->assertStatusCode(404);

        // - Download bill n°1 PDF file
        $this->client->get('/estimates/1/pdf');
        $this->assertStatusCode(200);
        $responseStream = $this->client->response->getBody();
        $this->assertTrue($responseStream->isReadable());
    }
}
