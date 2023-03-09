<?php
declare(strict_types=1);

namespace Robert2\Tests;

use PHPUnit\Framework\TestCase;
use Robert2\Support\Filesystem\UploadedFile;

final class FunctionsTest extends TestCase
{
    public function testGetExecutionTime(): void
    {
        $this->assertNotEmpty(getExecutionTime());
    }

    public function testMoveUploadedFile(): void
    {
        $sourceFile = TESTS_FILES_FOLDER . DS . 'file.pdf';

        $file = new UploadedFile(
            $sourceFile,
            13269,
            UPLOAD_ERR_OK,
            'Uploaded File for Tests.pdf',
            'application/pdf',
        );

        // - Déplace le fichier de test d'upload dans le dossier de destination.
        $filename = moveUploadedFile(TMP_FOLDER, $file);
        $destinationFile = TMP_FOLDER . DS . $filename;
        $exists = file_exists($destinationFile);

        // - Remet le fichier dans son dossier d'origine.
        if ($exists) {
            @rename($destinationFile, $sourceFile);
        }

        $this->assertEquals('Uploaded-File-for-Tests.pdf', $filename);
        $this->assertTrue($exists);
    }

    public function testRoundDate(): void
    {
        // - Tests avec une précision de 15 minutes
        $dateTests = [
            '2021-09-01 10:05' => '2021-09-01 10:00',
            '2021-09-01 10:08' => '2021-09-01 10:15',
            '2021-09-01 10:28' => '2021-09-01 10:30',
            '2021-09-01 10:36' => '2021-09-01 10:30',
            '2021-09-01 10:42' => '2021-09-01 10:45',
            '2021-09-01 10:51' => '2021-09-01 10:45',
            '2021-09-01 10:57' => '2021-09-01 11:00',
            '2021-09-01 23:58' => '2021-09-02 00:00',
            '2021-09-02 00:01' => '2021-09-02 00:00',
        ];
        foreach ($dateTests as $dateTest => $expected) {
            $date = new \DateTime($dateTest);
            $result = roundDate($date)->format('Y-m-d H:i');
            $this->assertEquals($expected, $result);
        }

        // - Tests avec une précision de 30 minutes
        $dateTests = [
            '2021-09-01 10:05' => '2021-09-01 10:00',
            '2021-09-01 10:08' => '2021-09-01 10:00',
            '2021-09-01 10:18' => '2021-09-01 10:30',
            '2021-09-01 10:36' => '2021-09-01 10:30',
            '2021-09-01 10:42' => '2021-09-01 10:30',
            '2021-09-01 10:51' => '2021-09-01 11:00',
            '2021-09-01 10:57' => '2021-09-01 11:00',
            '2021-09-01 23:58' => '2021-09-02 00:00',
            '2021-09-02 00:01' => '2021-09-02 00:00',
        ];
        foreach ($dateTests as $dateTest => $expected) {
            $date = new \DateTime($dateTest);
            $result = roundDate($date, 30)->format('Y-m-d H:i');
            $this->assertEquals($expected, $result);
        }
    }
}
