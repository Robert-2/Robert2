<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithModel;
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
        $settings = $this->getModelClass()::getList();
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

        $result = $this->getModelClass()::staticEdit(1, $postData);
        return $response->withJson($result->toArray(), SUCCESS_OK);
    }
}
