<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Http\Request;
use Loxya\Models\Enums\Group;
use Loxya\Models\OpeningHour;
use Loxya\Models\Setting;
use Loxya\Services\Auth;
use Loxya\Support\Arr;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

final class SettingController extends BaseController
{
    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $isAdmin = Auth::is(Group::ADMINISTRATION);
        $settings = Setting::getList($isAdmin);

        // - Ajout des horaires d'ouverture.
        Arr::set($settings, 'general.openingHours', OpeningHour::all());

        // - Ajout de l'URL public et du mode d'affichage du calendrier, si activé.
        $publicCalendar = $settings['calendar']['public'];
        if ($isAdmin && $publicCalendar['enabled']) {
            $settings['calendar']['public']['url'] = null;
            if (!empty($publicCalendar['uuid'])) {
                $settings['calendar']['public']['url'] = (
                    urlFor('public-calendar', [
                        'uuid' => $publicCalendar['uuid'],
                    ])
                );
            }
        }
        if (!$publicCalendar['enabled']) {
            unset($settings['calendar']['public']['displayedPeriod']);
        }
        unset($settings['calendar']['public']['uuid']);

        // - Spécifique OSS
        unset($settings['reservation']);
        unset($settings['eventSummary']['showUnitsSerialNumbers']);

        return $response->withJson($settings, StatusCode::STATUS_OK);
    }

    public function update(Request $request, Response $response): ResponseInterface
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        Setting::bulkEdit($postData);

        return $this->getAll($request, $response);
    }

    public function reset(Request $request, Response $response): ResponseInterface
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
