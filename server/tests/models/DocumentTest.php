<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\Document;

final class DocumentTest extends TestCase
{
    public function testGetFilePathAttribute(): void
    {
        $expected = [
            1 => DATA_FOLDER . DS . 'materials' . DS . 'documents' . DS . '1' . DS . 'User-manual.pdf',
            2 => DATA_FOLDER . DS . 'materials' . DS . 'documents' . DS . '1' . DS . '3c1ab2d8-f3cf-4de4-9a3d-371ff35afbb6.pdf',
            3 => DATA_FOLDER . DS . 'events' . DS . 'documents' . DS . '2' . DS . '04350a8c-d14b-4ab1-a4d2-e1efc248ffcb.xls',
            6 => DATA_FOLDER . DS . 'technicians' . DS . 'documents' . DS . '2' . DS . 'bed8c87e-104b-4174-bb05-b169243b1fb4.xls',
        ];
        foreach ($expected as $id => $expectedPath) {
            $this->assertSame($expectedPath, Document::find($id)->path);
        }
    }

    public function testRemove(): void
    {
        $document = Document::find(1);
        $filePath = $document->path;
        copy($filePath, $filePath . '_backup.pdf');

        $this->assertTrue(Document::findOrFail($document->id)->delete());
        $this->assertNull(Document::find($document->id));
        $this->assertFalse(file_exists($filePath));

        rename($filePath . '_backup.pdf', $filePath);
    }
}
