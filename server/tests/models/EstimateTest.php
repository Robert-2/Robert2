<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Brick\Math\BigDecimal as Decimal;
use Illuminate\Support\Carbon;
use Robert2\API\Models\Beneficiary;
use Robert2\API\Models\Estimate;
use Robert2\API\Models\Event;
use Robert2\API\Models\User;
use Robert2\API\Services\I18n;
use Robert2\Support\Pdf;

final class EstimateTest extends TestCase
{
    public function testValidation()
    {
        $estimate = new Estimate([
            'date' => '',
            'booking_start_date' => '',
            'booking_end_date' => '',
            'degressive_rate' => 100_000.0,
            'discount_rate' => 101.5,
            'vat_rate' => -5.0,
            'total_without_taxes' => 1_000_000_000_000,
            'total_replacement' => -20,
            'currency' => 'a',
        ]);
        $estimate->booking()->associate(Event::findOrFail(1));
        $estimate->beneficiary()->associate(Beneficiary::findOrFail(1));
        $errors = $estimate->validationErrors();

        $expectedErrors = [
            'date' => ["Ce champ est obligatoire", "Cette date n'est pas valide"],
            'degressive_rate' => ["Ce champ n'est pas valide"],
            'discount_rate' => ["Ce champ n'est pas valide"],
            'vat_rate' => ["Ce champ n'est pas valide"],
            'total_replacement' => ["Ce champ n'est pas valide"],
            'currency' => [
                "Toutes les règles requises doivent être validées",
                "Doit être en majuscule",
                "3 caractères attendus",
            ],
            'booking_start_date' => ["Cette date n'est pas valide"],
            'booking_end_date' => ["Cette date n'est pas valide"],
            'daily_total_without_discount' => ["Doit être un chiffre à virgule"],
            'daily_total_discountable' => ["Doit être un chiffre à virgule"],
            'daily_total_discount' => ["Doit être un chiffre à virgule"],
            'daily_total_without_taxes' => ["Doit être un chiffre à virgule"],
            'daily_total_taxes' => ["Doit être un chiffre à virgule"],
            'daily_total_with_taxes' => ["Doit être un chiffre à virgule"],
            'total_without_taxes' => ["Ce champ n'est pas valide"],
            'total_taxes' => ["Doit être un chiffre à virgule"],
            'total_with_taxes' => ["Doit être un chiffre à virgule"],
        ];
        $this->assertEquals($expectedErrors, $errors);
    }

    public function testCreateFromEvent()
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        $event = tap(Event::findOrFail(2), function ($event) {
            $event->discount_rate = Decimal::of('25.9542');
        });
        $result = Estimate::createFromBooking($event, User::findOrFail(1));
        $expected = [
            'id' => 2,
            'date' => '2022-10-22 18:42:36',
            'url' => 'http://loxya.test/estimates/2/pdf',
            'booking_type' => Event::TYPE,
            'booking_id' => 2,
            'booking_title' => 'Second événement',
            'booking_start_date' => '2018-12-18 00:00:00',
            'booking_end_date' => '2018-12-19 23:59:59',
            'beneficiary_id' => 3,
            'materials' => [
                [
                    'id' => 4,
                    'estimate_id' => 2,
                    'material_id' => 1,
                    'name' => 'Console Yamaha CL3',
                    'reference' => 'CL3',
                    'unit_price' => '300.00',
                    'total_price' => '900.00',
                    'replacement_price' => '19400.00',
                    'is_hidden_on_bill' => false,
                    'is_discountable' => false,
                    'quantity' => 3,
                ],
                [
                    'id' => 5,
                    'estimate_id' => 2,
                    'material_id' => 2,
                    'name' => 'Processeur DBX PA2',
                    'reference' => 'DBXPA2',
                    'unit_price' => '25.50',
                    'total_price' => '51.00',
                    'replacement_price' => '349.90',
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'quantity' => 2,
                ],
            ],
            'degressive_rate' => '1.75',
            'discount_rate' => '25.9542',
            'vat_rate' => '20.00',

            'daily_total_without_discount' => '951.00',
            'daily_total_discountable' => '51.00',
            'daily_total_discount' => '13.24',
            'daily_total_without_taxes' => '937.76',

            // - Taxes.
            'daily_total_taxes' => '187.55',
            'daily_total_with_taxes' => '1125.31',

            // - Totaux.
            'total_without_taxes' => '1641.08',
            'total_taxes' => '328.22',
            'total_with_taxes' => '1969.30',

            'total_replacement' => '58899.80',
            'currency' => 'EUR',
            'author_id' => 1,
            'created_at' => '2022-10-22 18:42:36',
            'updated_at' => '2022-10-22 18:42:36',
            'deleted_at' => null,
        ];
        $result = $result->append('materials')->attributesToArray();
        $this->assertEquals($expected, $result);
    }

    public function testToPdf()
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        $result = Estimate::findOrFail(1)->toPdf(new I18n('fr'));
        $this->assertInstanceOf(Pdf::class, $result);
        $this->assertSame('devis-testing-corp-20210130-1400-jean-fountain.pdf', $result->getName());
        $this->assertMatchesHtmlSnapshot($result->getRawContent());
    }
}
