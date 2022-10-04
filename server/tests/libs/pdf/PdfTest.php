<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\Lib\Pdf\Pdf;
use Robert2\Lib\Domain\EventData;
use Robert2\API\Models\Event;
use Robert2\Fixtures\RobertFixtures;

final class PdfTest extends TestCase
{
    protected $_testHtmlFile = __DIR__ . DS . 'files/test.html';
    protected $_pdfResultFile = __DIR__ . DS . 'files/result.pdf';

    public function testGetResult(): void
    {
        $html = file_get_contents($this->_testHtmlFile);
        $pdf = new Pdf($html);
        $result = $pdf->getResult();
        $this->assertNotEmpty($result);
    }

    public function testSaveToFile(): void
    {
        // - Removes the result PDF file if already exists
        if (file_exists($this->_pdfResultFile)) {
            unlink($this->_pdfResultFile);
        }

        $html = file_get_contents($this->_testHtmlFile);
        $pdf = new Pdf($html);
        $this->assertTrue($pdf->saveToFile($this->_pdfResultFile));
        $this->assertTrue(file_exists($this->_pdfResultFile));

        // - Check if result file and expected file have the same size
        $resultSize = filesize($this->_pdfResultFile);
        $expectedSize = filesize(__DIR__ . DS . 'files/expected_save.pdf');
        $this->assertEquals($expectedSize, $resultSize);

        // - Clean result file (comment this line if you want to check the content of './files/result.pdf')
        unlink($this->_pdfResultFile);
    }

    public function testCreateFromTemplateNotFoundError(): void
    {
        // - Template doesn't exist
        $this->expectException(\Twig\Error\LoaderError::class);
        $this->expectExceptionMessage("Unable to find template \"pdf/_inexistant-template_.twig\"");
        Pdf::createFromTemplate('_inexistant-template_', [], $this->_pdfResultFile);
    }

    public function testCreateFromTemplate(): void
    {
        // - Removes the result PDF file if already exists
        if (file_exists($this->_pdfResultFile)) {
            unlink($this->_pdfResultFile);
        }

        // - Reset fixtures (needed to load event's data)
        try {
            RobertFixtures::resetDataWithDump();
        } catch (\Exception $e) {
            $this->fail(sprintf("Unable to reset fixtures: %s", $e->getMessage()));
        }

        // - Render a bill template to PDF
        $data = (new EventData(Event::find(1)))
            ->setDiscountRate(10.0)
            ->toBillingPdfData(new \DateTime('2020-02-10'), '2020-00002');

        $pdfContent = Pdf::createFromTemplate('bill-default', $data, $this->_pdfResultFile);
        $this->assertNotEmpty($pdfContent);
    }
}
