<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models;
use Robert2\API\Errors;
use Robert2\API\I18n\I18n;
use Robert2\API\Config\Config;

final class BillTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Bill();
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(1, $result);
    }

    public function testGetEvent()
    {
        $result = $this->model::find(1)->event->toArray();
        $expected = [
            'id'         => 1,
            'title'      => 'Premier événement',
            'location'   => 'Gap',
            'start_date' => '2018-12-17 00:00:00',
            'end_date'   => '2018-12-18 23:59:59',
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetBeneficiary()
    {
        $result = $this->model::find(1)->beneficiary->toArray();
        $expected = [
            'id'          => 3,
            'first_name'  => "Client",
            'last_name'   => "Benef",
            'street'      => "156 bis, avenue des tests poussés",
            'postal_code' => "88080",
            'locality'    => "Wazzaville",
            'full_name'   => "Client Benef",
            'company'     => null,
            'country'     => null,
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetUser()
    {
        $result = $this->model::find(1)->user->toArray();
        $expected = [
            'id'       => 1,
            'pseudo'   => 'test1',
            'email'    => 'tester@robertmanager.net',
            'group_id' => 'admin',
            'person'   => [
                'id'          => 1,
                'user_id'     => 1,
                'first_name'  => 'Jean',
                'last_name'   => 'Fountain',
                'nickname'    => null,
                'email'       => 'tester@robertmanager.net',
                'phone'       => null,
                'street'      => '1, somewhere av.',
                'postal_code' => '1234',
                'locality'    => 'Megacity',
                'country_id'  => 1,
                'company_id'  => 1,
                'note'        => null,
                'created_at'  => null,
                'updated_at'  => null,
                'deleted_at'  => null,
                'full_name'   => 'Jean Fountain',
                'company'     => [
                    'id'          => 1,
                    'legal_name'  => 'Testing, Inc',
                    'street'      => '1, company st.',
                    'postal_code' => '1234',
                    'locality'    => 'Megacity',
                    'country_id'  => 1,
                    'phone'       => '+4123456789',
                    'note'        => 'Just for tests',
                    'created_at'  => null,
                    'updated_at'  => null,
                    'deleted_at'  => null,
                    'country'     => [
                        'id'   => 1,
                        'name' => 'France',
                        'code' => 'FR',
                    ],
                ],
                'country' => [
                    'id'   => 1,
                    'name' => 'France',
                    'code' => 'FR',
                ],
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetMaterials()
    {
        // - Test if JSON field 'materials' is well decoded
        $result = $this->model::find(1)->materials;
        $expected = [
            [
                'id'                    => 1,
                'name'                  => "Console Yamaha CL3",
                'reference'             => "PM5D",
                'park_id'               => 1,
                'category_id'           => 1,
                'sub_category_id'       => 1,
                'rental_price'          => 300.0,
                'stock_quantity'        => 5,
                'out_of_order_quantity' => 1,
                'replacement_price'     => 19400.0,
                'is_hidden_on_bill'     => false,
                'is_discountable'       => false,
            ],
            [
                'id'                    => 2,
                'name'                  => "Processeur DBX PA2",
                'reference'             => "DBXPA2",
                'park_id'               => 1,
                'category_id'           => 1,
                'sub_category_id'       => 2,
                'rental_price'          => 25.5,
                'stock_quantity'        => 2,
                'out_of_order_quantity' => null,
                'replacement_price'     => 349.9,
                'is_hidden_on_bill'     => false,
                'is_discountable'       => true,
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testDeleteByNumber()
    {
        // - Bill does not exists, nothing happens
        $this->model->deleteByNumber('_inexistant_');
        $this->assertNotNull($this->model->find(1));

        // - Permanently deletes bill ID n°1
        $this->model->deleteByNumber('200130-00001');
        $this->assertNull($this->model->find(1));
    }

    public function testCreateFromEventNotFound()
    {
        $this->expectException(Errors\NotFoundException::class);
        $this->expectExceptionMessage("Event not found.");
        $this->model->createFromEvent(999, 1, 25);
    }

    public function testCreateFromEvent()
    {
        $result = $this->model->createFromEvent(2, 1, 25.9542);
        $newBillNumber = sprintf('%s-00002', date('ymd'));
        $expected = [
            'id'             => 2,
            'number'         => $newBillNumber,
            'date'           => 'fakedTestContent',
            'event_id'       => 2,
            'beneficiary_id' => 3,
            'materials'      => [
                [
                    'id'                => 2,
                    'name'              => 'Processeur DBX PA2',
                    'reference'         => 'DBXPA2',
                    'park_id'           => 1,
                    'category_id'       => 1,
                    'sub_category_id'   => 2,
                    'rental_price'      => 25.5,
                    'replacement_price' => 349.9,
                    'is_hidden_on_bill' => false,
                    'is_discountable'   => true,
                    'quantity'          => 2,
                ],
                [
                    'id'                => 1,
                    'name'              => 'Console Yamaha CL3',
                    'reference'         => 'CL3',
                    'park_id'           => 1,
                    'category_id'       => 1,
                    'sub_category_id'   => 1,
                    'rental_price'      => 300,
                    'replacement_price' => 19400,
                    'is_hidden_on_bill' => false,
                    'is_discountable'   => false,
                    'quantity'          => 3
                ],
            ],
            'degressive_rate'    => 1.75,
            'discount_rate'      => 25.9542,
            'vat_rate'           => 20.0,
            'due_amount'         => 1641.09,
            'replacement_amount' => 58899.8,
            'currency'           => 'EUR',
            'user_id'            => 1,
            'created_at'         => 'fakedTestContent',
            'updated_at'         => 'fakedTestContent',
        ];
        $safeResult = $result->toArray();
        foreach (['date', 'created_at', 'updated_at'] as $field) {
            $safeResult[$field] = 'fakedTestContent';
        }
        $this->assertEquals($expected, $safeResult);

        // - Check PDF file was created
        $i18n = new I18n(Config::getSettings('defaultLang'));
        $company = Config::getSettings('companyData');
        $fileName = sprintf(
            'TEST-%s-%s-%s-%s.pdf',
            $i18n->translate("Bill"),
            slugify($company['name']),
            $newBillNumber,
            'Client_Benef'
        );
        $filePath = DATA_FOLDER . DS . 'bills' . DS . $fileName;
        $this->assertTrue(file_exists($filePath));

        // - Remove PDF file (comment this line if you want to check the result)
        unlink($filePath);
    }
}
