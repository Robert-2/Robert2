<?php
namespace Robert2\Tests;

use Robert2\API\Models\Document;

final class DocumentsTest extends ApiTestCase
{
    public function testGetDocumentFile()
    {
        // - Document inexistant
        $this->client->get('/documents/999/download');
        $this->assertStatusCode(404);

        // - Téléchargement du document #1
        $responseStream = $this->client->get('/documents/1/download');
        $this->assertStatusCode(200);
        $this->assertTrue($responseStream->isReadable());
    }

    public function testDelete()
    {
        // - Document inexistant
        $this->client->get('/documents/999/download');
        $this->assertStatusCode(404);

        // - Backup préalable à la suppression du document #1
        $document = Document::find(1);
        $filePath = $document->file_path;
        copy($filePath, $filePath . '_backup.pdf');
        // - Suppression du document
        $this->client->delete('/api/documents/1');
        $this->assertStatusCode(200);
        $this->assertResponseData(['destroyed' => true]);
        $this->assertFalse(file_exists($filePath));
        // - Restauration du fichier
        rename($filePath . '_backup.pdf', $filePath);
    }
}
