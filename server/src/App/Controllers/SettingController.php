<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Http\Request;
use Loxya\Models\Enums\Group;
use Loxya\Models\Setting;
use Loxya\Services\Auth;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;
use Slim\Interfaces\RouteParserInterface;

class SettingController extends BaseController
{
    private RouteParserInterface $routeParser;

    public function __construct(Container $container, RouteParserInterface $routeParser)
    {
        parent::__construct($container);

        $this->routeParser = $routeParser;
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getAll(Request $request, Response $response): Response
    {
        $isAdmin = Auth::is(Group::ADMIN);
        $settings = Setting::getList($isAdmin);

        // - Ajout de l'URL public du calendrier, si activé.
        $publicCalendar = $settings['calendar']['public'];
        if ($isAdmin && $publicCalendar['enabled']) {
            $settings['calendar']['public']['url'] = null;
            if (!empty($publicCalendar['uuid'])) {
                $settings['calendar']['public']['url'] = $this
                    ->routeParser
                    ->fullUrlFor($request->getUri(), 'public-calendar', [
                        'uuid' => $publicCalendar['uuid'],
                    ]);
            }
        }
        unset($settings['calendar']['public']['uuid']);

        return $response->withJson($settings, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function update(Request $request, Response $response): Response
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        Setting::staticEdit(null, $postData);

        return $this->getAll($request, $response);
    }

    public function reset(Request $request, Response $response): Response
    {
        $key = $request->getAttribute('key');

        // - La partie client manipule l'URL formatée du calendrier public
        //   => On permet donc le reset via cette "clé".
        if ($key === 'calendar.public.url') {
            $key = 'calendar.public.uuid';
        }

        Setting::findOrFail($key)->reset();

        return $this->getAll($request, $response);
    }
}
