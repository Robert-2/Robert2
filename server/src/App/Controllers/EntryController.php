<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Robert2\API\Config\Config;
use Robert2\API\Http\Request;
use Robert2\API\Services\Auth;
use Robert2\API\Services\View;
use Slim\Http\Response;

class EntryController extends BaseController
{
    private View $view;

    private Auth $auth;

    private array $settings;

    public function __construct(Container $container, View $view, Auth $auth)
    {
        parent::__construct($container);

        $this->view = $view;
        $this->auth = $auth;
        $this->settings = $container->get('settings');
    }

    public function default(Request $request, Response $response)
    {
        if (!Config::customConfigExists()) {
            return $response->withRedirect('/install', 302); // - 302 Redirect.
        }

        $user = Auth::user();

        $serverConfig = $this->getServerConfig();
        return $this->view->render($response, 'entries/default.twig', \compact('serverConfig'));
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected function getServerConfig(): array
    {
        $rawConfig = $this->settings;
        $baseUrl = rtrim($rawConfig['apiUrl'], '/');

        return [
            'baseUrl' => $baseUrl,
            'api' => [
                'url' => $baseUrl . '/api',
                'headers' => $rawConfig['apiHeaders'],
                'version' => Config::getVersion(),
            ],
            'auth' => [
                'cookie' => $rawConfig['auth']['cookie'],
                'timeout' => $rawConfig['sessionExpireHours'],
            ],
            'companyName' => $rawConfig['companyData']['name'],
            'defaultPaginationLimit' => $rawConfig['maxItemsPerPage'],
            'defaultLang' => $rawConfig['defaultLang'],
            'currency' => $rawConfig['currency'],
            'billingMode' => $rawConfig['billingMode'],
            'maxFileUploadSize' => $rawConfig['maxFileUploadSize'],
            'colorSwatches' => $rawConfig['colorSwatches'],
            'authorizedFileTypes' => $rawConfig['authorizedFileTypes'],
            'authorizedImageTypes' => $rawConfig['authorizedImageTypes'],
        ];
    }
}
