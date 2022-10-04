<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use \phpCAS;
use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\User;
use Robert2\API\Services\Auth;
use Robert2\API\Validation\Validator as V;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class AuthController extends BaseController
{
    /** @var Auth */
    protected $auth;

    public function __construct(Container $container, Auth $auth)
    {
        parent::__construct($container);

        $this->auth = $auth;
    }

    public function getSelf(Request $request, Response $response): Response
    {
        $user = Auth::user()
            ->append('language');

        return $response->withJson($user, StatusCode::STATUS_OK);
    }

    public function loginWithForm(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $this->_validateAuthRequest($postData);

        $user = User::fromLogin($postData['identifier'], $postData['password']);

        $result = $user
            ->append('language')
            ->serialize();

        $result['token'] = Auth\JWT::generateToken($user);

        return $response->withJson($result, StatusCode::STATUS_OK);
    }

    public function logout(Request $request, Response $response)
    {
        if (!$this->auth->logout()) {
            // TODO: Ajouter un message d'erreur passé au client (lorsqu'on aura un moyen de le faire)
            //       l'informant du fait qu'il n'a pas été complétement
            //       déconnécté.
            return $response->withRedirect('/');
        }
        return $response->withRedirect('/login#bye');
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _validateAuthRequest(array $data): void
    {
        $valid  = true;
        $errors = ['identifier' => [], 'password' => []];

        if (!isset($data['identifier']) || !V::notEmpty()->validate($data['identifier'])) {
            $errors['identifier'][] = "Identifier must not be empty";
            $valid = false;
        }

        if (!isset($data['password']) || !V::notEmpty()->validate($data['password'])) {
            $errors['password'][] = "Password must not be empty";
            $valid = false;
        }

        if (isset($data['password']) && !V::length(4)->validate($data['password'])) {
            $errors['password'][] = "Password must have a length greater than 4";
            $valid = false;
        }

        if (!$valid) {
            throw new ValidationException($errors);
        }
    }
}
