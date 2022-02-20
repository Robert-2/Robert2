<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Robert2\API\Controllers\Traits\WithModel;
use Robert2\API\Models\Setting;
use Robert2\API\Services\Auth;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;
use Slim\Interfaces\RouteParserInterface;

class SettingController extends BaseController
{
    use WithModel;

    /** @var array */
    private $globalSettings;

    private RouteParserInterface $routeParser;

    public function __construct(Container $container, RouteParserInterface $routeParser)
    {
        parent::__construct($container);

        $this->globalSettings = $container->get('settings');
        $this->routeParser = $routeParser;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(Request $request, Response $response): Response
    {
        $isAdmin = Auth::is('admin');
        $settings = Setting::getList($isAdmin);

        // - Ajout de l'URL public du calendrier, si activé.
        $publicCalendar = $settings['calendar']['public'];
        if ($isAdmin && $publicCalendar['enabled']) {
            $settings['calendar']['public']['url'] = null;
            if (!empty($publicCalendar['uuid'])) {
                $settings['calendar']['public']['url'] = $this
                    ->routeParser
                    ->fullUrlFor($request->getUri(), 'public-calendar', [
                        'uuid' => $publicCalendar['uuid']
                    ]);
            }
        }
        unset($settings['calendar']['public']['uuid']);

        return $response->withJson($settings);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    public function update(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        Setting::staticEdit(null, $postData);

        $response = $response->withStatus(SUCCESS_OK);
        return $this->getAll($request, $response);
    }

    public function reset(Request $request, Response $response): Response
    {
        $key = $request->getAttribute('key');

        // - La partie client manipule l'URL formattée du calendrier public
        //   => On permet donc le reset via cette "clé".
        if ($key === 'calendar.public.url') {
            $key = 'calendar.public.uuid';
        }

        Setting::findOrFail($key)->reset();

        $response = $response->withStatus(SUCCESS_OK);
        return $this->getAll($request, $response);
    }
}
