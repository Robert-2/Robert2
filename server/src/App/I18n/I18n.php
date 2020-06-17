<?php
declare(strict_types=1);

namespace Robert2\API\I18n;

use DElfimov\Translate\Translate;
use DElfimov\Translate\Loader\PhpFilesLoader;

class I18n
{
    protected $translation;
    protected $config = [
        "default"   => "en",
        "available" => ["en", "fr"],
    ];

    public function __construct(?string $lang = null)
    {
        $fileLoader = new PhpFilesLoader(__DIR__ . '/locales');

        $this->translation = new Translate($fileLoader, $this->config);

        // - Overwrite Accept-Language header if needed
        if ($lang && in_array($lang, $this->config['available'])) {
            $this->translation->setLanguage($lang);
        }
    }

    public function translate(string $message, $args = null): string
    {
        return $this->translation->t($message, $args);
    }

    public function plural(string $message, $num, $args = null): string
    {
        return $this->translation->plural($message, $num, $args);
    }

    public function getCurrentLocale(): string
    {
        return $this->translation->getLanguage();
    }
}
