<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class InvoicesTest extends ApiTestCase
{
    public static function data(?int $id = null)
    {
        return static::dataFactory($id, [
            [
                'id' => 1,
                'number' => '2020-00001',
                'date' => '2020-01-30 14:00:00',
                'url' => 'http://loxya.test/invoices/1/pdf',
                'discount_rate' => '4.4766',
                'total_without_taxes' => '544.13',
                'total_with_taxes' => '652.96',
                'currency' => 'EUR',
            ],
        ]);
    }

    public function testDownloadPdf(): void
    {
        // - Si la facture n'existe pas...
        $this->client->get('/invoices/999/pdf');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Téléchargement du PDF de la facture n°1.
        $responseStream = $this->client->get('/invoices/1/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot((string) $responseStream);
    }
}
