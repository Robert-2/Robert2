<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Services\I18n;
use Loxya\Support\Pdf\Pdf;

final class PdfTest extends TestCase
{
    public function testAsBinaryString(): void
    {
        $html = file_get_contents(TESTS_FILES_FOLDER . DS . 'pdf.html');
        $this->assertNotEmpty((new Pdf('test-pdf', $html, new I18n('fr')))->asBinaryString());
    }

    public function testCreateFromTemplateNotFoundError(): void
    {
        $this->assertThrow(\Twig\Error\LoaderError::class, static fn () => (
            Pdf::createFromTemplate('_inexistant-template_', new I18n('fr'), 'inexistant-template', [])
        ));
    }
}
