<?php
declare(strict_types=1);

namespace Loxya\Contracts;

use Loxya\Services\I18n;
use Loxya\Support\Pdf\PdfInterface;

interface Pdfable
{
    /**
     * Permet de convertir l'instance au format PDF.
     * Le contenu de ce PDF dépend du type d'objet.
     *
     * @param I18n $i18n L'instance de I18n correspondante à la langue
     *                   dans laquelle sera généré le PDF.
     *
     * @return PdfInterface Le PDF lié à l'instance.
     */
    public function toPdf(I18n $i18n): PdfInterface;
}
