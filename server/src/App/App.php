<?php
declare(strict_types=1);

namespace Robert2\API;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Robert2\API\Config\Config;
use Robert2\API\Errors\ErrorHandler;
use Robert2\API\Http\Request as Request;
use Slim\Exception\HttpNotFoundException;
use Slim\Factory\AppFactory;
use Slim\Factory\ServerRequestCreatorFactory;
use Slim\Http\Response;
use Slim\Interfaces\RouteParserInterface;
use Slim\Routing\RouteCollectorProxy;

/**
 * App.
 *
 * @method self add(\Psr\Http\Server\MiddlewareInterface|string|callable $middleware)
 * @method Response handle(Request $request)
 */
class App
{
    private $container;
    private $app;

    public function __construct()
    {
        $this->container = Kernel::boot()->getContainer();
        $this->app = AppFactory::create(null, $this->container);

        $this->configureMiddlewares();
        $this->configureRouter();
        $this->configureErrorHandlers();
        $this->configureCors();
    }

    /**
     * @inheritDoc
     */
    public function run(): void
    {
        // - Crée la requête.
        ServerRequestCreatorFactory::setSlimHttpDecoratorsAutomaticDetection(false);
        $serverRequestCreator = ServerRequestCreatorFactory::create();
        $request = new Request($serverRequestCreator->createServerRequestFromGlobals());

        // - Lance l'application.
        $this->app->run($request);
    }

    public function __call($name, $arguments)
    {
        return \call_user_func_array([$this->app, $name], $arguments);
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function configureCors()
    {
        $isCORSEnabled = (bool) $this->container->get('settings')['enableCORS'];
        if (Config::getEnv() === 'test' || !$isCORSEnabled) {
            return;
        }

        $this->app->add(function (Request $request, RequestHandler $handler): ResponseInterface {
            /** @var \Slim\Http\Response $response */
            $response = $handler->handle($request);

            $response = $response->withHeader('Access-Control-Allow-Origin', '*');
            $response = $response->withHeader('Access-Control-Allow-Credentials', 'true');
            $response = $response->withHeader(
                'Access-Control-Allow-Headers',
                'X-Requested-With, Content-Type, Accept, Origin, Authorization'
            );

            return $response;
        });
    }

    protected function configureRouter()
    {
        $settings = $this->container->get('settings');
        $isCORSEnabled = (bool) $settings['enableCORS'] && Config::getEnv() !== 'test';
        $useRouterCache = (bool) $settings['useRouterCache'] && Config::getEnv() === 'production';
        $routeCollector = $this->app->getRouteCollector();

        // - Ajoute le parseur de route au conteneur.
        $this->container->set(RouteParserInterface::class, $routeCollector->getRouteParser());

        // - Base Path
        $baseUrlParts = parse_url(Config::getSettings('apiUrl'));
        $basePath = rtrim($baseUrlParts['path'] ?? '', '/');
        $routeCollector->setBasePath($basePath);

        // - Route cache
        if ($useRouterCache) {
            $routeCollector->setCacheFile(CACHE_FOLDER . DS . 'routes.php');
        }

        // - Middleware
        $this->app->addRoutingMiddleware();

        //
        // -- Routes: Api
        //

        $getActionFqn = function ($action) {
            return sprintf('Robert2\\API\\Controllers\\%s', $action);
        };

        $this->app->group('/api', function (RouteCollectorProxy $group) use ($isCORSEnabled, $getActionFqn) {
            // - Autorise les requêtes de type OPTIONS sur les routes d'API.
            if ($isCORSEnabled) {
                $group->options('/{routes:.+}', function (Request $request, Response $response) {
                    return $response;
                });
            }

            // - Toutes les routes d'API sont définies dans le fichier `Config/routes.php`.
            $routeMethods = include CONFIG_FOLDER . DS . 'routes.php';
            foreach ($routeMethods as $method => $routes) {
                foreach ($routes as $route => $action) {
                    $group->$method($route, $getActionFqn($action));
                }
            }

            // - Not found API
            $group
                ->any('/[{path:.*}]', function (Request $request) {
                    throw new HttpNotFoundException($request);
                })
                ->setName('api-catch-not-found');
        });

        //
        // -- Routes: "statics"
        //

        // - Install
        $this->app->map(['GET', 'POST'], '/install', $getActionFqn('SetupController:index'));
        $this->app->get('/install/end', $getActionFqn('SetupController:endInstall'));

        // - "Raw" / Download files
        $this->app->get('/estimates/{id:[0-9]+}/pdf[/]', $getActionFqn('EstimateController:getOnePdf'));
        $this->app->get('/invoices/{id:[0-9]+}/pdf[/]', $getActionFqn('InvoiceController:getOnePdf'));
        $this->app->get('/events/{id:[0-9]+}/pdf[/]', $getActionFqn('EventController:getOnePdf'));
        $this->app->get('/documents/{id:[0-9]+}/download[/]', $getActionFqn('DocumentController:getOne'));
        $this->app->get('/materials/{id:[0-9]+}/picture[/]', $getActionFqn('MaterialController:getPicture'));
        $this->app->get('/materials/pdf[/]', $getActionFqn('MaterialController:getAllPdf'));

        $this->app->get('/calendar/public/{uuid:[a-z0-9-]+}.ics', $getActionFqn('CalendarController:public'))
            ->setName('public-calendar');

        // - Login services
        $this->app->get('/logout', $getActionFqn('AuthController:logout'));

        // - Points d'entrée de l'application
        $this->app->get('/[{path:.*}]', $getActionFqn('EntryController:default'));
    }

    protected function configureMiddlewares()
    {
        $this->app->add(new Middlewares\BodyParser);
        $this->app->add(new Middlewares\Acl);
        $this->app->add([$this->container->get('auth'), 'middleware']);
        $this->app->add(new Middlewares\Pagination);
    }

    protected function configureErrorHandlers()
    {
        $shouldLog = Config::getEnv() !== 'test';
        $displayErrorDetails = (
            (bool) $this->container->get('settings')['displayErrorDetails']
            || in_array(Config::getEnv(), ['production', 'test'], true)
        );

        $logger = $this->container->get('logger')->createLogger('error');
        $errorMiddleware = $this->app->addErrorMiddleware($displayErrorDetails, $shouldLog, $shouldLog, $logger);

        // - Default error handler.
        $defaultErrorHandler = new ErrorHandler(
            $this->app->getCallableResolver(),
            $this->app->getResponseFactory(),
            $logger
        );
        $errorMiddleware->setDefaultErrorHandler($defaultErrorHandler);
    }
}
