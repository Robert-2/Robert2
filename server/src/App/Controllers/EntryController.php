<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Robert2\API\Config\Config;
use Robert2\API\Services\View;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class EntryController extends BaseController
{
    /** @var View */
    private $view;

    /** @var array */
    private $settings;

    public function __construct(Container $container, View $view)
    {
        parent::__construct($container);

        $this->view = $view;
        $this->settings = $container->get('settings');
    }

    public function index(Request $request, Response $response)
    {
        if (!Config::customConfigExists()) {
            return $response->withRedirect('/install', 302); // 302 Redirect
        }

        $serverConfig = $this->getServerConfig();
        return $this->view->render($response, 'webclient.twig', \compact('serverConfig'));
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected function getServerConfig(): string
    {
        $rawConfig = $this->settings;
        $baseUrl = preg_replace('/\/$/', '', $rawConfig['apiUrl']);

        $config = [
            'baseUrl' => $baseUrl,
            'api' => [
                'url' => $baseUrl . '/api',
                'headers' => $rawConfig['apiHeaders'],
                'version' => Config::getVersion(),
            ],
            'auth' => [
                'cookie' => $rawConfig['auth']['cookie'],
                'timeout' => $rawConfig['sessionExpireHours'],
                'isCASEnabled' => $rawConfig['auth']['CAS']['enabled'],
            ],
            'handScanner' => [
                'inputLayout' => $rawConfig['handScanner']['inputLayout'],
            ],
            'defaultPaginationLimit' => $rawConfig['maxItemsPerPage'],
            'defaultLang' => $rawConfig['defaultLang'],
            'currency' => $rawConfig['currency'],
            'beneficiaryTagName' => $rawConfig['defaultTags']['beneficiary'],
            'technicianTagName' => $rawConfig['defaultTags']['technician'],
            'billingMode' => $rawConfig['billingMode'],
            'degressiveRate' => sprintf(
                'function (daysCount) { return %s; }',
                $rawConfig['degressiveRateFunction']
            ),
        ];

        // TODO: Passer la formule `$rawConfig['degressiveRateFunction']` directement au js
        //       sans la wrappée dans une fonction et utiliser le filtre twig
        //       `| json_encode(constant('Robert2\\API\\Config\\Config::JSON_OPTIONS'))`
        $jsonConfig = json_encode($config, Config::JSON_OPTIONS);
        $jsonConfig = preg_replace('/"degressiveRate": "/', '"degressiveRate": ', $jsonConfig);
        return preg_replace('/}"/', '}', $jsonConfig);
    }
}
