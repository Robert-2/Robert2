<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;
use Robert2\API\Validation\Validator as V;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Services\Auth;
use Robert2\API\Models\User;

class AuthController
{
    /** @var User */
    protected $user;

    public function __construct($container)
    {
        $this->container = $container;
        $this->user = new User;
    }

    public function getSelf(Request $request, Response $response): Response
    {
        return $response->withJson(Auth::user(), SUCCESS_OK);
    }

    public function loginWithForm(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        $this->_validateAuthRequest($data);

        $user = $this->user->getLogin($data['identifier'], $data['password']);

        $responseData['user'] = $user->toArray();
        $responseData['token'] = Auth\JWT::generateToken($user);

        return $response->withJson($responseData, SUCCESS_OK);
    }

    public function logout(Request $request, Response $response)
    {
        $auth = $this->container->get('auth');
        if (!$auth->logout()) {
            // TODO: Ajouter un message d'erreur passé au client (lorsqu'on aura un moyen de le faire)
            //       l'informant du fait qu'il n'a pas été complétement
            //       déconnécté.
            return $response->withRedirect('/');
        }
        return $response->withRedirect('/login#bye');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Internal Methods
    // —
    // ——————————————————————————————————————————————————————

    protected function _validateAuthRequest(array $data): void
    {
        $ex     = new ValidationException;
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
            $ex->setValidationErrors($errors);
            throw $ex;
        }
    }
}
