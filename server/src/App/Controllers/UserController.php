<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\Builder;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Loxya\Models\Enums\Group;
use Loxya\Models\User;
use Loxya\Services\Auth;
use Loxya\Support\Arr;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpForbiddenException;
use Slim\Http\Response;

final class UserController extends BaseController
{
    use WithCrud {
        update as protected _originalUpdate;
        delete as protected _originalDelete;
    }

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $group = $request->getRawEnumQueryParam('group', Group::all());
        $search = $request->getStringQueryParam('search');
        $limit = $request->getIntegerQueryParam('limit');
        $ascending = $request->getBooleanQueryParam('ascending', true);
        $onlyDeleted = $request->getBooleanQueryParam('deleted', false);
        $orderBy = $request->getOrderByQueryParam('orderBy', User::class);

        $query = User::query()
            ->when(
                $search !== null && strlen($search) >= 2,
                static fn (Builder $subQuery) => $subQuery->search($search),
            )
            ->when($group !== null, static fn (Builder $subQuery) => (
                $subQuery->where('group', '=', $group)
            ))
            ->when($onlyDeleted, static fn (Builder $subQuery) => (
                $subQuery->onlyTrashed()
            ))
            ->customOrderBy($orderBy, $ascending ? 'asc' : 'desc');

        $results = $this->paginate($request, $query, $limit);
        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getOne(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getAttribute('id');
        if ($id !== 'self') {
            if (Auth::user()->id === (int) $id) {
                throw new HttpForbiddenException(
                    $request,
                    'Self retrieving this way is forbidden, use `GET /api/users/self`.',
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
                    'Self update this way is forbidden, use `PUT /api/users/self`.',
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
            throw new HttpBadRequestException($request, 'No data was provided.');
        }

        $postData = User::unserialize(
            Arr::except($postData, array_merge(User::SETTINGS_ATTRIBUTES, [
                'id',
                'group',
            ])),
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
        $id = $request->getAttribute('id');
        if ($id !== 'self') {
            if (Auth::user()->id === (int) $id) {
                throw new HttpForbiddenException(
                    $request,
                    'Self retrieving this way is forbidden, use `GET /api/users/self/settings`.',
                );
            }

            // - Si ce n'est pas un admin, on empêche la récupération des autres utilisateurs.
            if (!Auth::is(Group::ADMIN)) {
                throw new HttpForbiddenException($request);
            }
        } else {
            $id = Auth::user()->id;
        }

        $user = User::findOrFail((int) $id);
        $result = $user->serialize(User::SERIALIZE_SETTINGS);
        return $response->withJson($result, StatusCode::STATUS_OK);
    }

    public function updateSettings(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getAttribute('id');
        if ($id !== 'self') {
            if (Auth::user()->id === (int) $id) {
                throw new HttpForbiddenException(
                    $request,
                    'Self updating this way is forbidden, use `PUT /api/users/self/settings`.',
                );
            }

            // - Si ce n'est pas un admin, on empêche la récupération des autres utilisateurs.
            if (!Auth::is(Group::ADMIN)) {
                throw new HttpForbiddenException($request);
            }
        } else {
            $id = Auth::user()->id;
        }

        $postData = Arr::only(
            (array) $request->getParsedBody(),
            User::SETTINGS_ATTRIBUTES,
        );
        if (empty($postData)) {
            throw new HttpBadRequestException($request, 'No data was provided.');
        }

        try {
            $user = User::staticEdit((int) $id, $postData);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
            if (empty($errors)) {
                throw $e;
            }

            $errors = User::serializeValidation($errors);
            throw new ValidationException($errors);
        }

        $result = $user->serialize(User::SERIALIZE_SETTINGS);
        return $response->withJson($result, StatusCode::STATUS_OK);
    }

    public function delete(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        if (Auth::user()->id === $id) {
            throw new HttpForbiddenException($request, 'Self deletion is forbidden.');
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
