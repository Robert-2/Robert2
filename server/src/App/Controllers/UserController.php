<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Support\Arr;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Loxya\Models\Enums\Group;
use Loxya\Models\User;
use Loxya\Services\Auth;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpForbiddenException;
use Slim\Http\Response;

class UserController extends BaseController
{
    use WithCrud {
        update as protected _originalUpdate;
        delete as protected _originalDelete;
    }

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $paginated = (bool) $request->getQueryParam('paginated', true);
        $search = $request->getQueryParam('search', null);
        $group = $request->getQueryParam('group', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool) $request->getQueryParam('ascending', true);
        $onlyDeleted = (bool) $request->getQueryParam('deleted', false);

        $orderBy = $request->getQueryParam('orderBy', null);
        if (!in_array($orderBy, ['pseudo', 'email', 'group'], true)) {
            $orderBy = null;
        }

        $query = (new User())
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($search)
            ->getAll($onlyDeleted);

        if (in_array($group, Group::all(), true)) {
            $query->where('group', '=', $group);
        }

        if ($paginated) {
            $results = $this->paginate($request, $query, is_numeric($limit) ? (int) $limit : null);
        } else {
            $results = $query->get();
        }

        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getOne(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getAttribute('id');
        if ($id !== 'self') {
            if (Auth::user()->id === (int) $id) {
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

        $user = static::_formatOne(User::findOrFail((int) $id));
        return $response->withJson($user, StatusCode::STATUS_OK);
    }

    public function update(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getAttribute('id');
        if ($id !== 'self') {
            if (Auth::user()->id === (int) $id) {
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

        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $postData = User::unserialize(
            Arr::except($postData, array_merge(User::SETTINGS_ATTRIBUTES, [
                'id',
                'group',
            ]))
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

    public function getSettings(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $user = User::findOrFail($id);

        return $response->withJson($user->settings, StatusCode::STATUS_OK);
    }

    public function updateSettings(Request $request, Response $response): ResponseInterface
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $id = (int) $request->getAttribute('id');
        $data = Arr::only($postData, User::SETTINGS_ATTRIBUTES);

        try {
            $user = User::staticEdit($id, $data);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
            if (empty($errors)) {
                throw $e;
            }

            $errors = User::serializeValidation($errors);
            throw new ValidationException($errors);
        }

        return $response->withJson($user->settings, StatusCode::STATUS_OK);
    }

    public function delete(Request $request, Response $response): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        if (Auth::user()->id === $id) {
            throw new HttpForbiddenException($request, "Self deletion is forbidden.");
        }
        return $this->_originalDelete($request, $response);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected static function _formatOne(User $user): array
    {
        return $user->serialize(User::SERIALIZE_DETAILS);
    }
}
