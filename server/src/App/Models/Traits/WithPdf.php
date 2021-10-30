<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use Robert2\API\Config\Config;
use Robert2\API\Services\I18n;
use Robert2\Lib\Pdf\Pdf;

trait WithPdf
{
    protected $pdfTemplate = null;

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getPdfName($id): string
    {
        $model = static::withTrashed()->findOrFail($id);

        $company = Config::getSettings('companyData');
        $i18n = new I18n(Config::getSettings('defaultLang'));
        $fileName = sprintf(
            '%s-%s-%s.pdf',
            $i18n->translate(class_basename($this)),
            slugify($company['name']),
            $model->title ?: $model->id
        );
        if (Config::getEnv() === 'test') {
            $fileName = sprintf('TEST-%s', $fileName);
        }

        return $fileName;
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _getPdfAsString(array $data): string
    {
        if (empty($this->pdfTemplate)) {
            throw new \RuntimeException("Missing model's PDF template name");
        }
        return Pdf::createFromTemplate($this->pdfTemplate, $data);
    }
}
