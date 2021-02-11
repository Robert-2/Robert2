<?php
declare(strict_types=1);

namespace Robert2\API;

use Robert2\API\Config as Config;
use Robert2\API\Errors as Errors;
use Robert2\API\Middlewares as Middlewares;
use Slim\Http\Headers;
use Slim\Http\Response;

class App
{
    private $app;

    public function __construct()
    {
        $this->app = new \Slim\App([
            'settings' => Config\Config::getSettings(),
            'response' => $this->_getCORSResponse()
        ]);

        $this->_setContainer();
        $this->_setAppRoutes();
        $this->_setMiddlewares();
    }

    public function configureAndGet(): \Slim\App
    {
        if (isTestMode()) {
            $settings = $this->app->getContainer()->get('settings');
            $settings->replace([
                'displayErrorDetails' => true,
                'routerCacheFile'     => false,
            ]);
        }

        return $this->app;
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    private function _getCORSResponse()
    {
        return function ($container): Response {
            $settings = $container->get('settings');
            $headers = ['Content-Type' => 'text/html; charset=UTF-8'];

            if (!isTestMode() && $settings['enableCORS']) {
                $headers = array_merge($headers, [
                    'Access-Control-Allow-Origin'  => '*',
                    'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, Accept, Origin, Authorization',
                    'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS'
                ]);
            }

            return (new Response(200, new Headers($headers)))->withProtocolVersion('1.1');
        };
    }

    private function _setContainer(): void
    {
        $container = $this->app->getContainer();

        $container->register(new \Projek\Slim\MonologProvider());

        $container = $this->_setHttpCachePovider($container);
        $container = $this->_setErrorHandlers($container);
        $container = $this->_setControllers($container);
    }

    private function _setHttpCachePovider(\Slim\Container $container): \Slim\Container
    {
        $container['cache'] = function () {
            return new \Slim\HttpCache\CacheProvider();
        };

        return $container;
    }

    private function _setErrorHandlers(\Slim\Container $container): \Slim\Container
    {
        // - Error (500) handler
        $container['errorHandler'] = function ($c) use ($container) {
            return new Errors\ErrorHandler($c);
        };
        $container['phpErrorHandler'] = function ($c) use ($container) {
            // @codeCoverageIgnoreStart
            return new Errors\ErrorHandler($c);
            // @codeCoverageIgnoreEnd
        };
        // - Method Not Allowed (405) handler
        $container['notAllowedHandler'] = function ($c) {
            return new Errors\MethodNotAllowedHandler();
        };
        // - Not Found (404) handler
        $container['notFoundHandler'] = function ($c) {
            return new Errors\NotFoundHandler();
        };

        return $container;
    }

    private function _setControllers(\Slim\Container $container): \Slim\Container
    {
        foreach (glob(__DIR__ . '/Controllers/*Controller.php') as $controller) {
            $controllerPath = pathinfo($controller);
            $controllerName = $controllerPath['filename'];

            if ($controllerName === "BaseController") {
                continue;
            }

            $container[$controllerName] = function ($container) use ($controllerName) {
                $controllerClass = "Robert2\\API\\Controllers\\$controllerName";
                return new $controllerClass($container);
            };
        }

        return $container;
    }

    private function _setMiddlewares(): void
    {
        $this->app->add(new Middlewares\Pagination);

        $request = $this->app->getContainer()->get('request');
        // - Auth middlewares are skipped for unit tests
        if (!isTestMode() && !$request->isOptions()) {
            $this->app->add(new Middlewares\Acl);
            // - JWT security middleware (added last to be executed first)
            $this->app->add(Middlewares\Security::initJwtAuth());
        }
    }

    private function _setAppRoutes()
    {
        // - "Static" routes
        $this->app->map(['GET', 'POST'], '/install', 'HomeController:install')->setName('install');

        $settings = $this->app->getContainer()->get('settings');
        if ($settings['enableCORS']) {
            $this->app->options('/api/{routes:.+}', function ($request, $response, $args) {
                return $response;
            });
        }

        // - All API routes are defined in `ApiRouter.php`
        $this->app->group('/api', function () {
            $routeMethods = (new ApiRouter())->getRoutes();

            foreach ($routeMethods as $method => $routes) {
                foreach ($routes as $route => $controller) {
                    $this->$method($route, $controller);
                }
            }
        });

        // - Not found API
        $this->app->any('/api/[{path:.*}]', function () {
            throw new Errors\NotFoundException();
        });

        // - Download files
        $this->app->get('/bills/{id:[0-9]+}/pdf[/]', 'BillController:getOnePdf')->setName('getBillPdf');
        $this->app->get('/events/{id:[0-9]+}/pdf[/]', 'EventController:getOnePdf')->setName('getEventPdf');
        $this->app->get('/documents/{id:[0-9]+}/download[/]', 'DocumentController:getOne')->setName('getDocumentFile');

        // - All remaining non-API routes should be handled by Front-End Router
        $this->app->get('/[{path:.*}]', 'HomeController:entrypoint');
    }
}
