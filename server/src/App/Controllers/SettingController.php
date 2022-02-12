<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithModel;
use Robert2\API\Models\Setting;
use Robert2\API\Services\Auth;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class SettingController extends BaseController
{
    use WithModel;

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(Request $request, Response $response): Response
    {
        $settings = Setting::getList(Auth::is('admin'));
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

        $settings = Setting::getList();
        return $response->withJson($settings, SUCCESS_OK);
    }
}
