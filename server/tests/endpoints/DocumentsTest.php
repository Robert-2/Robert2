<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Models\Document;

final class DocumentsTest extends ApiTestCase
{
    public static function data(int $id)
    {
        return static::_dataFactory($id, [
            [
                'id' => 1,
                'name' => 'User-manual.pdf',
                'type' => 'application/pdf',
                'size' => 24681233,
                'url' => 'http://loxya.test/documents/1',
                'created_at' => '2021-02-12 13:23:02',
            ],
            [
                'id' => 2,
                'name' => 'warranty.pdf',
                'type' => 'application/pdf',
                'size' => 124068,
                'url' => 'http://loxya.test/documents/2',
                'created_at' => '2021-02-12 13:25:02',
            ],
            [
                'id' => 3,
                'name' => 'plan-de-salle.xls',
                'type' => 'application/vnd.ms-excel',
                'size' => 49802,
                'url' => 'http://loxya.test/documents/3',
                'created_at' => '2023-05-01 15:15:20',
            ],
            [
                'id' => 4,
                'name' => "Carte de l'étudiant.png",
                'type' => 'image/x-png',
                'size' => 9397,
                'url' => 'http://loxya.test/documents/4',
                'created_at' => '2023-05-02 17:32:05',
            ],
            [
                'id' => 5,
                'name' => 'bon_de_sortie.doc',
                'type' => 'application/msword',
                'size' => 10014149,
                'url' => 'http://loxya.test/documents/5',
                'created_at' => '2023-05-01 15:15:20',
            ],
            [
                'id' => 6,
                'name' => 'emploi-du-temps.xls',
                'type' => 'application/vnd.ms-excel',
                'size' => 70001,
                'url' => 'http://loxya.test/documents/6',
                'created_at' => '2023-05-01 15:15:20',
            ],
        ]);
    }

    public function testGetDocumentFile()
    {
        // - Document inexistant
        $this->client->get('/documents/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Téléchargement du document #1
        $responseStream = $this->client->get('/documents/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
    }

    public function testDelete()
    {
        // - Backup préalable à la suppression du document #1
        $filePath = Document::findOrFail(1)->path;
        copy($filePath, $filePath . '_backup.pdf');

        // - Suppression du document
        $this->client->delete('/api/documents/1');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertFalse(file_exists($filePath));

        // - Restauration du fichier
        rename($filePath . '_backup.pdf', $filePath);
    }
}
