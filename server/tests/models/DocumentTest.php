<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models\Document;

final class DocumentTest extends TestCase
{
    public function testGetFilePathAttribute()
    {
        $document = Document::find(1);
        $this->assertEquals(
            DATA_FOLDER . DS . 'materials' . DS . 'documents' . DS . '1' . DS . 'User-manual.pdf',
            $document->file_path
        );
    }

    public function testRemove()
    {
        $document = Document::find(1);
        $filePath = $document->file_path;
        copy($filePath, $filePath . '_backup.pdf');

        Document::staticRemove($document->id);
        $this->assertNull(Document::find($document->id));
        $this->assertFalse(file_exists($filePath));

        rename($filePath . '_backup.pdf', $filePath);
    }

    public function testGetFilePath()
    {
        // - Without a filename
        $result = Document::getFilePath(1);
        $this->assertEquals(DATA_FOLDER . DS . 'materials' . DS . 'documents' . DS . '1', $result);

        // - With a filename
        $result = Document::getFilePath(1, 'file.pdf');
        $this->assertEquals(
            DATA_FOLDER . DS . 'materials' . DS . 'documents' . DS . '1' . DS . 'file.pdf',
            $result
        );
    }
}
