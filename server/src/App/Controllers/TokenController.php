<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;
use Robert2\API\Validation\Validator as V;

use Robert2\API\Errors\ValidationException;
use Robert2\API\Middlewares\Security;
use Robert2\API\Models\User;
use Robert2\API\Config\Config;

class TokenController
{
    public function __construct($container)
    {
        $this->container = $container;
        $this->config = $container->get('settings');

        $this->user = new User;
    }

    public function auth(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        $this->_validateAuthRequest($data);

        $user = $this->user->getLogin($data['identifier'], $data['password'])->toArray();

        $defaultTokenDuration = Config::getSettings('sessionExpireHours');
        $tokenDuration = $user['settings']['auth_token_validity_duration'] ?: $defaultTokenDuration;

        $responseData['user'] = $user;
        $responseData['token'] = Security::generateToken($user, $tokenDuration);

        if (!isTestMode()) {
            $expireHours = $this->config['sessionExpireHours'] ?: 12;
            $expireTime = time() + $expireHours * 60 * 60;
            setcookie(
                $this->config['httpAuthHeader'],
                $responseData['token'],
                $expireTime,
                '/'
            );
        }

        return $response->withJson($responseData, SUCCESS_OK);
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
