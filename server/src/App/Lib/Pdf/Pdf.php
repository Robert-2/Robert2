<?php
declare(strict_types=1);

namespace Robert2\Lib\Pdf;

use Dompdf\Dompdf;
use Robert2\API\Config\Config;
use Robert2\API\Services\I18n;
use Robert2\API\Services\View;

class Pdf
{
    protected $DomPdf;

    public function __construct(string $html)
    {
        $this->DomPdf = new Dompdf([
            'tempDir' => VAR_FOLDER . DS . 'tmp',
            'fontCache' => VAR_FOLDER . DS . 'cache',
            'logOutputFile' => VAR_FOLDER . DS . 'logs' . DS . 'pdf.html',
            'defaultMediaType' => 'print',
            'defaultPaperSize' => 'a4',
            'defaultPaperOrientation' => 'portrait',
            'defaultFont' => 'DejaVu Sans',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
        ]);

        $this->DomPdf->loadHtml($html);
    }

    public function getResult(): string
    {
        $this->DomPdf->render();
        return $this->DomPdf->output();
    }

    public function saveToFile(string $filePath): bool
    {
        $result = $this->getResult();

        return (bool)file_put_contents($filePath, $result);
    }

    public static function createFromTemplate(string $templateName, array $data): string
    {
        $data['formatCurrencyOptions'] = [
            // - Disable thousand grouping in numbers, because there are weird results in PDFs with some locales
            //   (i.e. the `?` character appear for thousand separator, when FR)
            'grouping_used' => false
        ];
        $data['baseUrl'] = trim(Config::getSettings('apiUrl'), '/');

        $i18n = new I18n(Config::getSettings('defaultLang'));
        $template = sprintf('pdf/%s.twig', $templateName);
        $html = (new View($i18n))->fetch($template, $data);
        // - Uncomment the following 2 lines to debug the PDF files content in the browser
        // echo $html;
        // exit;
        return (new static($html))->getResult();
    }
}
