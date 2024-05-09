<?php
declare(strict_types=1);

namespace Loxya\Models\Traits;

use Loxya\Services\I18n;
use Loxya\Support\Pdf;

trait Pdfable
{
    public function toPdf(I18n $i18n): Pdf
    {
        if (!defined('static::PDF_TEMPLATE')) {
            throw new \RuntimeException("Missing model's PDF template name");
        }

        return Pdf::createFromTemplate(
            static::PDF_TEMPLATE,
            $i18n,
            $this->getPdfName($i18n),
            $this->getPdfData(),
        );
    }

    // ------------------------------------------------------
    // -
    // -    Abstract / Overwritable methods
    // -
    // ------------------------------------------------------

    abstract protected function getPdfName(I18n $i18n): string;

    protected function getPdfData(): array
    {
        return [];
    }
}
