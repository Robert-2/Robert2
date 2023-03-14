<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class InvoicesTest extends ApiTestCase
{
    public static function data(int $id)
    {
        return static::_dataFactory($id, [
            [
                'id' => 1,
                'number' => '2020-00001',
                'date' => '2020-01-30 14:00:00',
                'url' => 'http://loxya.test/invoices/1/pdf',
                'discount_rate' => '50.0000',
                'total_without_taxes' => '547.31',
                'total_with_taxes' => '658.52',
                'currency' => 'EUR',
            ],
        ]);
    }

    public function testDownloadPdf()
    {
        // - Si la facture n'existe pas...
        $this->client->get('/invoices/999/pdf');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Téléchargement du PDF de la facture n°1.
        $responseStream = $this->client->get('/invoices/1/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot($responseStream->getContents());
    }
}
