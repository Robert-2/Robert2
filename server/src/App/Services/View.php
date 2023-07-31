<?php
declare(strict_types=1);

namespace Loxya\Services;

use Brick\Math\BigDecimal as Decimal;
use Psr\Http\Message\ResponseInterface as Response;
use Loxya\Config\Config;
use Slim\Views\Twig;
use Twig\Extension\DebugExtension;
use Twig\Extra\Html\HtmlExtension;
use Twig\Extra\Intl\IntlExtension;
use Twig\Extra\String\StringExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

final class View
{
    private Twig $view;

    private I18n $i18n;

    private ?string $folder;

    /**
     * Constructeur.
     *
     * @param I18n $i18n - L'instance d'I18n qui sera utilisée pour définir la langue de la vue.
     * @param string|null $folder - Un éventuel dossier dans lequel sera recherché les fichiers de vue.
     *                              Le fait de passer ce paramètre activera aussi la détection des
     *                              fichiers de vue par langue.
     */
    public function __construct(I18n $i18n, ?string $folder = null)
    {
        $cachePath = false;
        if (Config::getEnv() === 'production') {
            $cachePath = CACHE_FOLDER . DS . 'views';
        }

        $this->i18n = $i18n;
        $this->folder = $folder ? trim($folder, '\\/') : null;
        $this->view = Twig::create(VIEWS_FOLDER, [
            'debug' => Config::getEnv() !== 'production',
            'cache' => $cachePath,
        ]);

        //
        // - Global variables
        //

        $this->view->getEnvironment()->addGlobal('env', Config::getEnv());
        $this->view->getEnvironment()->addGlobal('locale', $i18n->getLocale());

        //
        // - Extensions
        //

        $this->view->addExtension(new HtmlExtension());
        $this->view->addExtension(new IntlExtension());
        $this->view->addExtension(new StringExtension());
        $this->view->addExtension(new DebugExtension());

        //
        // - Functions
        //

        $translate = new TwigFunction('translate', [$i18n, 'translate']);
        $plural = new TwigFunction('plural', [$i18n, 'plural']);
        $version = new TwigFunction('version', $this->getVersion());
        $clientAssetFunction = new TwigFunction('client_asset', $this->getClientAsset());

        $this->view->getEnvironment()->addFunction($translate);
        $this->view->getEnvironment()->addFunction($plural);
        $this->view->getEnvironment()->addFunction($version);
        $this->view->getEnvironment()->addFunction($clientAssetFunction);

        //
        // - Filters
        //

        $formatCurrencyFilter = new TwigFilter('format_currency', $this->formatCurrencyFilter());
        $formatNumberFilter = new TwigFilter('format_number', $this->formatNumberFilter());
        $formatNumberStyleFilter = new TwigFilter('format_*_number', $this->formatNumberStyleFilter());

        $this->view->getEnvironment()->addFilter($formatCurrencyFilter);
        $this->view->getEnvironment()->addFilter($formatNumberFilter);
        $this->view->getEnvironment()->addFilter($formatNumberStyleFilter);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes publiques
    // -
    // ------------------------------------------------------

    /**
     * Permet de récupérer de récupérer le rendu d'une vue.
     *
     * @param string $template - Le fichier de vue à rendre.
     * @param array $data - Un tableau de données à passer à la vue.
     *
     * @return string - Le contenu de la vue rendue.
     */
    public function fetch(string $template, array $data = []): string
    {
        $template = $this->resolveTemplatePath($template);
        return $this->view->fetch($template, $data);
    }

    /**
     * Permet de rendre une vue et d'assigner son contenu à la réponse fournie.
     *
     * @param Response $response - La réponse dans laquelle on veut voir le rendu ajouté.
     * @param string $template - Le fichier de vue à rendre.
     * @param array $data - Un tableau de données à passer à la vue.
     *
     * @return Response - La réponse passée en paramètres mais avec le rendu de la vue ajouté à son contenu.
     */
    public function render(Response $response, string $template, array $data = []): Response
    {
        $response->getBody()->write($this->fetch($template, $data));
        return $response;
    }

    // ------------------------------------------------------
    // -
    // -    Fonctions Twig
    // -
    // ------------------------------------------------------

    private function resolveTemplatePath(string $template): string
    {
        $template = ltrim($template, '\\/');
        $template = !str_ends_with($template, '.twig')
            ? sprintf('%s.twig', $template)
            : $template;

        if ($this->folder === null) {
            return $template;
        }

        $loader = $this->view->getLoader();
        foreach ([$this->i18n->getLocale(), $this->i18n->getLanguage()] as $langFolder) {
            $templateLocalizedPath = $this->folder . DS . $langFolder . DS . $template;
            if ($loader->exists($templateLocalizedPath)) {
                return $templateLocalizedPath;
            }
        }

        return $this->folder . DS . $template;
    }

    private function getVersion(): callable
    {
        return function (): string {
            return Config::getVersion();
        };
    }

    private function getClientAsset(): callable
    {
        $host = Config::getEnv() === 'development'
            ? 'http://localhost:8081'
            : '';

        $basePath = sprintf('%s/webclient', rtrim($host, '/'));
        return function ($path) use ($basePath) {
            return vsprintf('%s/%s?v=%s', [
                $basePath,
                ltrim($path, '/'),
                Config::getVersion(),
            ]);
        };
    }

    // ------------------------------------------------------
    // -
    // -    Filtres Twig
    // -
    // ------------------------------------------------------

    private function formatCurrencyFilter(): callable
    {
        return function ($amount, string $currency, array $attrs = [], ?string $locale = null): string {
            $amount = $amount instanceof Decimal ? $amount->toFloat() : $amount;
            return (new IntlExtension())->formatCurrency($amount, $currency, $attrs, $locale);
        };
    }

    private function formatNumberFilter(): callable
    {
        // phpcs:ignore Generic.Files.LineLength.TooLong
        return function ($number, array $attrs = [], string $style = 'decimal', string $type = 'default', ?string $locale = null): string {
            $number = $number instanceof Decimal ? $number->toFloat() : $number;
            return (new IntlExtension())->formatNumber($number, $attrs, $style, $type, $locale);
        };
    }

    private function formatNumberStyleFilter(): callable
    {
        // phpcs:ignore Generic.Files.LineLength.TooLong
        return function (string $style, $number, array $attrs = [], string $type = 'default', ?string $locale = null): string {
            $number = $number instanceof Decimal ? $number->toFloat() : $number;
            return (new IntlExtension())->formatNumberStyle($style, $number, $attrs, $type, $locale);
        };
    }
}
