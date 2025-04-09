<?php
declare(strict_types=1);

namespace Loxya\Services;

use Loxya\Config\Config;
use Loxya\Services\I18n\Loader;
use Loxya\Services\I18n\LoaderInterface;

/**
 * I18n class.
 *
 * This class is highly based on Dmitry Elfimov <elfimov@gmail.com> work
 * on `Translate` package (https://github.com/delfimov/Translate/). This
 * package is subject to the MIT License whose terms are as follows:
 *
 *    Copyright 2017 Dmitry Elfimov
 *
 *    Permission is hereby granted, free of charge, to any person
 *    obtaining a copy of this software and associated documentation
 *    files (the "Software"), to deal in the Software without restriction,
 *    including without limitation the rights to use, copy, modify, merge,
 *    publish, distribute, sublicense, and/or sell copies of the Software,
 *    and to permit persons to whom the Software is furnished to do so,
 *    subject  to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be
 *    included in all copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 *    AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 *    OR OTHER DEALINGS IN THE SOFTWARE.
 */
final class I18n
{
    /**
     * Un tableau regroupant les langues prises en charge avec la
     * région par défaut utilisée pour chacune d'elles.
     */
    public const AVAILABLE_LANGUAGES = [
        'en' => 'GB',
        'fr' => 'FR',
    ];

    /**  Langue courante. */
    private string $language;

    /** Région de langue courante. */
    private string|null $region;

    /**
     * Est-ce que la langue a été spécifiée explicitement ou
     * est-ce une détection automatisée ?
     */
    private bool $isLangExplicitlySet;

    /** Chargeur de messages. */
    private LoaderInterface $loader;

    /**
     * Constructeur.
     *
     * @param string|null $lang Permet de forcer une langue. Si elle n'est pas explicitement
     *                          passée, le système la détectera automatiquement.
     */
    public function __construct(?string $lang = null)
    {
        $this->loader = new Loader(LOCALES_FOLDER);
        $this->isLangExplicitlySet = $lang !== null;
        $this->setLanguage($lang ?? $this->detectLanguage());
    }

    /**
     * Permet de récupérer une phrase traduite à partir d'une clé de traduction.
     *
     * @param string $key - La clé de traduction.
     * @param ?array $args - Les arguments supplémentaires à passer à la chaîne de traduite.
     *
     * @return string - La phrase traduite si trouvée, la clé de traduction d'origine sinon.
     */
    public function translate(string $key, $args = null): string
    {
        $string = $this->loader->has($key) ? $this->loader->get($key) : $key;
        if (isset($args)) {
            if (!is_array($args)) {
                $args = func_get_args();
                array_shift($args);
            }
            $string = vsprintf($string, $args);
        }
        return $string;
    }

    /**
     * Permet de récupérer une phrase traduite dans un pluriel en particulier
     * grâce à `$count` à partir d'une clé de traduction.
     *
     * @param string $key - La clé de traduction.
     * @param int $count - Le compte pour lequel on veut récupérer le pluriel.
     * @param ?array $args - Les arguments supplémentaires à passer à la chaîne de traduite.
     *
     * @return string - La phrase traduite si trouvée, la clé de traduction d'origine sinon.
     */
    public function plural(string $key, int $count, $args = null): string
    {
        $string = $this->loader->has($key) ? $this->loader->get($key) : $key;
        $choices = is_array($string) ? $string : explode('|', $string);

        $args ??= [$count];
        if (!is_array($args)) {
            $args = array_slice(func_get_args(), 2);
        }

        $plural = static::pluralRule($this->language, $count);
        $string = $choices[$plural] ?? $choices[0];
        return vsprintf($string, $args);
    }

    /**
     * Permet de récupérer la langue courante.
     *
     * @return string Le code (e.g. `fr`) de la langue courante.
     */
    public function getLanguage(): string
    {
        return $this->language;
    }

    /**
     * Permet de récupérer la locale courante.
     *
     * @return string Le code (e.g. `fr_FR`) de la locale courante.
     */
    public function getLocale(): string
    {
        if ($this->region === null) {
            return $this->language;
        }
        return sprintf('%s_%s', $this->language, strtoupper($this->region));
    }

    /**
     * Permet d'actualiser la langue.
     *
     * Ceci est utile uniquement si la langue a été automatiquement détectée et
     * que l'on a connaissance d'un événement qui a pu changer le langue de
     * l'utilisateur (par exemple son identification).
     */
    public function refreshLanguage(): void
    {
        if ($this->isLangExplicitlySet) {
            return;
        }
        $this->setLanguage($this->detectLanguage());
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    private function detectLanguage(): string
    {
        // - Si l'utilisateur est connecté, on récupère sa langue.
        $userLanguage = Auth::isAuthenticated() ? Auth::user()->language : null;
        if ($userLanguage && static::isLanguageAvailable($userLanguage)) {
            return $userLanguage;
        }

        // - Sinon, on recherche dans le header `Accept-Language`...
        $rawAcceptLanguages = env('HTTP_ACCEPT_LANGUAGE');
        if (!empty($rawAcceptLanguages)) {
            $acceptLanguages = array_reduce(
                array_map('trim', explode(',', $rawAcceptLanguages)),
                static function (array $result, string $tag) {
                    [$locale, $priority] = array_merge(array_map('trim', explode(';q=', $tag, 2)), [1]);
                    $result[$locale] ??= (float) $priority;
                    return $result;
                },
                [],
            );
            arsort($acceptLanguages);

            if (!empty($acceptLanguages)) {
                $synonyms = [
                    'gb' => 'en',
                    'us' => 'en',
                    'cn' => 'zh',
                    'hk' => 'zh',
                    'tw' => 'zh',
                ];
                foreach (array_keys($acceptLanguages) as $acceptLanguage) {
                    $acceptLanguage = $synonyms[$acceptLanguage] ?? $acceptLanguage;
                    if (static::isLanguageAvailable($acceptLanguage)) {
                        return $acceptLanguage;
                    }
                }
            }
        }

        // - Sinon, si la langue par défaut de l'application est disponible, on l'utilise...
        $defaultLanguage = Config::get('defaultLang');
        if (static::isLanguageAvailable($defaultLanguage)) {
            return $defaultLanguage;
        }

        // - Sinon on utilise la première langue dans les langues disponibles.
        return array_keys(static::AVAILABLE_LANGUAGES)[0];
    }

    private function setLanguage(string $language): void
    {
        if (!static::isLanguageAvailable($language)) {
            throw new \LogicException(sprintf("The requested language is not implemented (%s)", $language));
        }

        $languageParts = $this->getLanguageParts($language);
        $this->language = $languageParts['code'];
        $this->region = $languageParts['region'];

        $this->loader->setLanguage($languageParts['code']);
    }

    private static function isLanguageAvailable(string $language): bool
    {
        $code = static::getLanguageParts($language)['code'];
        return array_key_exists($code, static::AVAILABLE_LANGUAGES);
    }

    private static function getLanguageParts(string $language): array
    {
        $code = $language;
        $region = null;

        if (mb_strlen($language) > 2) {
            if (str_contains($language, '-')) {
                [$code, $region] = explode('-', $language, 2);
            } elseif (str_contains($language, '_')) {
                [$code, $region] = explode('_', $language, 2);
            }
        }
        $code = strtolower($code);

        // - Si on a pas de région, on prend celle par défaut si définie.
        if ($region === null && array_key_exists($code, static::AVAILABLE_LANGUAGES)) {
            $region = static::AVAILABLE_LANGUAGES[$code];
        }

        if ($region !== null) {
            $region = strtoupper($region);
        }

        return compact('code', 'region');
    }

    /**
     * The plural rules are derived from code of the Zend Framework (2010-09-25),
     * which is subject to the new BSD license (http://framework.zend.com/license/new-bsd).
     *
     * Copyright (c) 2005-2010 Zend Technologies USA Inc. (http://www.zend.com)
     * https://github.com/zendframework/zf1/blob/master/library/Zend/Translate/Plural.php
     *
     * @param string $language - Le code de la langue.
     * @param int $count - Le compte pour lequel on veut récupérer le pluriel.
     *
     * @return int - L'index de la règle pluriel à utiliser.
     */
    private static function pluralRule(string $language, int $count): int
    {
        /* phpcs:disable Generic.Files.LineLength.TooLong */
        switch ($language) {
            case 'az':
            case 'bo':
            case 'dz':
            case 'id':
            case 'ja':
            case 'jv':
            case 'ka':
            case 'km':
            case 'kn':
            case 'ko':
            case 'ms':
            case 'th':
            case 'tr':
            case 'vi':
            case 'zh':
                $index = 0;
                break;

            case 'af':
            case 'bn':
            case 'bg':
            case 'ca':
            case 'da':
            case 'de':
            case 'el':
            case 'en':
            case 'eo':
            case 'es':
            case 'et':
            case 'eu':
            case 'fa':
            case 'fi':
            case 'fo':
            case 'fur':
            case 'fy':
            case 'gl':
            case 'gu':
            case 'ha':
            case 'he':
            case 'hu':
            case 'is':
            case 'it':
            case 'ku':
            case 'lb':
            case 'ml':
            case 'mn':
            case 'mr':
            case 'nah':
            case 'nb':
            case 'ne':
            case 'nl':
            case 'nn':
            case 'no':
            case 'om':
            case 'or':
            case 'pa':
            case 'pap':
            case 'ps':
            case 'pt':
            case 'so':
            case 'sq':
            case 'sv':
            case 'sw':
            case 'ta':
            case 'te':
            case 'tk':
            case 'ur':
            case 'zu':
                $index = $count === 1 ? 0 : 1;
                break;

            case 'am':
            case 'bh':
            case 'fil':
            case 'fr':
            case 'gun':
            case 'hi':
            case 'ln':
            case 'mg':
            case 'nso':
            case 'xbr':
            case 'ti':
            case 'wa':
                $index = (($count === 0) || ($count === 1)) ? 0 : 1;
                break;

            case 'be':
            case 'bs':
            case 'hr':
            case 'ru':
            case 'sr':
            case 'uk':
                $index = ((($count % 10 === 1) && ($count % 100 !== 11)) ? 0 : ((($count % 10 >= 2) && ($count % 10 <= 4) && (($count % 100 < 10) || ($count % 100 >= 20))) ? 1 : 2));
                break;

            case 'cs':
            case 'sk':
                $index = $count === 1 ? 0 : ((($count >= 2) && ($count <= 4)) ? 1 : 2);
                break;

            case 'ga':
                $index = $count === 1 ? 0 : (($count === 2) ? 1 : 2);
                break;

            case 'lt':
                $index = ((($count % 10 === 1) && ($count % 100 !== 11)) ? 0 : ((($count % 10 >= 2) && (($count % 100 < 10) || ($count % 100 >= 20))) ? 1 : 2));
                break;

            case 'sl':
                $index = (($count % 100 === 1) ? 0 : (($count % 100 === 2) ? 1 : ((($count % 100 === 3) || ($count % 100 === 4)) ? 2 : 3)));
                break;

            case 'mk':
                $index = ($count % 10 === 1) ? 0 : 1;
                break;

            case 'mt':
                $index = $count === 1 ? 0 : ((($count === 0) || (($count % 100 > 1) && ($count % 100 < 11))) ? 1 : ((($count % 100 > 10) && ($count % 100 < 20)) ? 2 : 3));
                break;

            case 'lv':
                $index = $count === 0 ? 0 : ((($count % 10 === 1) && ($count % 100 !== 11)) ? 1 : 2);
                break;

            case 'pl':
                $index = $count === 1 ? 0 : ((($count % 10 >= 2) && ($count % 10 <= 4) && (($count % 100 < 12) || ($count % 100 > 14))) ? 1 : 2);
                break;

            case 'cy':
                $index = $count === 1 ? 0 : (($count === 2) ? 1 : ((($count === 8) || ($count === 11)) ? 2 : 3));
                break;

            case 'ro':
                $index = $count === 1 ? 0 : ((($count === 0) || (($count % 100 > 0) && ($count % 100 < 20))) ? 1 : 2);
                break;

            case 'ar':
                $index = $count === 0 ? 0 : ($count === 1 ? 1 : ($count === 2 ? 2 : ((($count >= 3) && ($count <= 10)) ? 3 : ((($count >= 11) && ($count <= 99)) ? 4 : 5 ))));
                break;

            default:
                $index = 0;
                break;
        }
        /* phpcs:enable Generic.Files.LineLength.TooLong */

        return $index;
    }
}
