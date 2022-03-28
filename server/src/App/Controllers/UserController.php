<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\User;
use Robert2\API\Models\UserSetting;
use Robert2\API\Services\Auth;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class UserController extends BaseController
{
    use WithCrud {
        delete as protected _originalDelete;
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $user = User::find($id);

        if (!$user) {
            throw new HttpNotFoundException($request);
        }

        return $response->withJson($user->toArray());
    }

    public function getSettings(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $user = User::find($id);

        if (!$user || !$user->settings) {
            throw new HttpNotFoundException($request);
        }

        return $response->withJson($user->settings);
    }

    public function updateSettings(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $id = (int)$request->getAttribute('id');
        $user = User::find($id);
        if (!$user) {
            throw new HttpNotFoundException($request);
        }

        $result = UserSetting::editByUser($user, $postData);
        return $response->withJson($result->toArray(), SUCCESS_OK);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (Auth::user()->id === $id) {
            throw new \InvalidArgumentException(
                "Cannot delete user that is currently logged in.",
                ERROR_VALIDATION
            );
        }
        return $this->_originalDelete($request, $response);
    }
}
