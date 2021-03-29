<?php
declare(strict_types=1);

namespace Robert2\Lib\Pdf;

use Dompdf\Dompdf;
use Twig\Extra\Intl\IntlExtension;

use Robert2\API\I18n\I18n;
use Robert2\API\Config\Config;

class Pdf
{
    protected $DomPdf;

    public function __construct(string $html)
    {
        $this->DomPdf = new Dompdf([
            'tempDir'                 => VAR_FOLDER . DS . 'tmp',
            'fontCache'               => VAR_FOLDER . DS . 'cache',
            'logOutputFile'           => VAR_FOLDER . DS . 'logs' . DS . 'pdf.html',
            'defaultMediaType'        => 'print',
            'defaultPaperSize'        => 'a4',
            'defaultPaperOrientation' => 'portrait',
            'defaultFont'             => 'DejaVu Sans',
            'isHtml5ParserEnabled'    => true,
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

        $baseTemplateDir = VIEWS_FOLDER . DS . 'pdf';
        $loader = new \Twig\Loader\FilesystemLoader($baseTemplateDir);

        $twig = new \Twig\Environment($loader, ['cache' => false]);
        $twig->addExtension(new IntlExtension());
        $twig->addExtension(new \Twig_Extensions_Extension_Text());

        $i18n = new I18n(Config::getSettings('defaultLang'));
        $translateFunction = new \Twig\TwigFunction('translate', [$i18n, 'translate']);
        $twig->addFunction($translateFunction);
        $pluralFunction = new \Twig\TwigFunction('plural', [$i18n, 'plural']);
        $twig->addFunction($pluralFunction);

        $template = $twig->load(sprintf('%s.twig', $templateName));
        $html = $template->render($data);

        // debug($html); exit;

        $pdf = new Pdf($html);
        return $pdf->getResult();
    }
}
