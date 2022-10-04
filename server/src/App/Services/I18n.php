<?php
declare(strict_types=1);

namespace Robert2\API\Services;

use DElfimov\Translate\Translate;
use Robert2\API\Services\I18n\Loader;

class I18n
{
    protected $translator;

    protected $config = [
        'default' => 'en',
        'available' => ['en', 'fr'],
    ];

    public function __construct(?string $lang = null)
    {
        $this->translator = new Translate(new Loader(LOCALES_FOLDER), $this->config);

        // - Overwrite Accept-Language header if needed
        if ($lang && in_array($lang, $this->config['available'])) {
            $this->translator->setLanguage($lang);
        }
    }

    public function translate(string $message, $args = null): string
    {
        return $this->translator->t($message, $args);
    }

    public function plural(string $message, $num, $args = null): string
    {
        return $this->translator->plural($message, $num, $args);
    }

    public function getCurrentLocale(): string
    {
        return $this->translator->getLanguage();
    }
}
