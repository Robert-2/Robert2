<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Enums\Group;
use Robert2\API\Models\User;
use Robert2\API\Models\UserSetting;
use Robert2\API\Services\Auth;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpForbiddenException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class UserController extends BaseController
{
    use WithCrud {
        update as protected _originalUpdate;
        delete as protected _originalDelete;
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = $request->getAttribute('id');
        if ($id !== 'self') {
            if (Auth::user()->id === (int)$id) {
                throw new HttpForbiddenException(
                    $request,
                    "Self retrieving this way is forbidden, use `GET /api/users/self`."
                );
            }

            // - Si ce n'est pas un admin, on empêche la récupération des autres utilisateurs.
            if (!Auth::is(Group::ADMIN)) {
                throw new HttpForbiddenException($request);
            }
        } else {
            $id = Auth::user()->id;
        }

        $user = static::_formatOne(User::findOrFail((int)$id));
        return $response->withJson($user, StatusCode::STATUS_OK);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = $request->getAttribute('id');
        if ($id !== 'self') {
            if (Auth::user()->id === (int)$id) {
                throw new HttpForbiddenException(
                    $request,
                    "Self update this way is forbidden, use `PUT /api/users/self`."
                );
            }

            // - Si ce n'est pas un admin, on empêche la modification des autres utilisateurs.
            if (!Auth::is(Group::ADMIN)) {
                throw new HttpForbiddenException($request);
            }

            return $this->_originalUpdate($request, $response);
        }

        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $postData = User::unserialize(
            array_without_keys($postData, [
                'id',
                'group',
            ])
        );

        try {
            $user = User::staticEdit(Auth::user()->id, $postData);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
            if (!empty($errors)) {
                $errors = User::serializeValidation($errors);
            }
            throw new ValidationException($errors);
        }

        $user = static::_formatOne($user);
        return $response->withJson($user, StatusCode::STATUS_OK);
    }

    public function getSettings(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $user = User::findOrFail($id);

        if (!$user->settings) {
            throw new HttpNotFoundException($request);
        }

        return $response->withJson($user->settings, StatusCode::STATUS_OK);
    }

    public function updateSettings(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $id = (int)$request->getAttribute('id');
        $user = User::findOrFail($id);

        $result = UserSetting::editByUser($user, $postData);
        return $response->withJson($result, StatusCode::STATUS_OK);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (Auth::user()->id === $id) {
            throw new HttpForbiddenException($request, "Self deletion is forbidden.");
        }
        return $this->_originalDelete($request, $response);
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected static function _formatOne(User $user): User
    {
        return $user;
    }
}
