<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;

use Robert2\API\Errors;
use Robert2\API\Models\User;
use Robert2\API\Config\Config;

class UserController extends BaseController
{
    public function __construct($container)
    {
        parent::__construct($container);

        $this->model = new User;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Model dedicated methods
    // —
    // ——————————————————————————————————————————————————————

    public function getOne(Request $request, Response $response): Response
    {
        $id   = (int)$request->getAttribute('id');
        $user = $this->model->find($id);

        if (!$user) {
            throw new Errors\NotFoundException;
        }

        unset($user->password);

        return $response->withJson($user->toArray());
    }

    public function getSettings(Request $request, Response $response): Response
    {
        $id   = (int)$request->getAttribute('id');
        $user = $this->model->find($id);

        if (!$user) {
            throw new Errors\NotFoundException;
        }

        $settings = $user->settings;
        if (!$settings) {
            throw new Errors\NotFoundException;
        }

        return $response->withJson($settings);
    }

    public function updateSettings(Request $request, Response $response): Response
    {
        $postData = $request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $id = (int)$request->getAttribute('id');
        if (!$this->model->exists($id)) {
            throw new Errors\NotFoundException;
        }

        $result = $this->model->setSettings($id, $postData);
        return $response->withJson($result, SUCCESS_OK);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $jwt = $request->getAttribute(Config::getSettings('JWTAttributeName'));

        if ($jwt && $jwt['user'] && $jwt['user']->id === $id) {
            throw new \InvalidArgumentException(
                "Cannot delete user that is currently logged in.",
                ERROR_VALIDATION
            );
        }

        return parent::delete($request, $response);
    }
}
