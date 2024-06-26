<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Services\I18n;
use Loxya\Support\Pdf;

final class PdfTest extends TestCase
{
    public function testGetContents(): void
    {
        $html = file_get_contents(TESTS_FILES_FOLDER . DS . 'pdf.html');
        $this->assertNotEmpty((new Pdf('test-pdf', $html))->getContent());
    }

    public function testCreateFromTemplateNotFoundError(): void
    {
        $this->assertException(\Twig\Error\LoaderError::class, static fn () => (
            Pdf::createFromTemplate('_inexistant-template_', new I18n('fr'), 'inexistant-template', [])
        ));
    }
}
