<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Loxya\Config\Config;
use Loxya\Http\Enums\FlashType;
use Loxya\Http\Request;
use Loxya\Models\User;
use Loxya\Services\Auth;
use Loxya\Services\Auth\Exceptions\AuthException;
use Odan\Session\FlashInterface;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Http\Response;

final class AuthController extends BaseController
{
    private FlashInterface $flash;

    private Auth $auth;

    public function __construct(
        Container $container,
        FlashInterface $flash,
        Auth $auth,
    ) {
        parent::__construct($container);

        $this->flash = $flash;
        $this->auth = $auth;
    }

    public function getSelf(Request $request, Response $response): ResponseInterface
    {
        $user = Auth::user()->serialize(User::SERIALIZE_SESSION);

        return $response->withJson($user, StatusCode::STATUS_OK);
    }

    public function loginWithForm(Request $request, Response $response): ResponseInterface
    {
        $identifier = $request->getParsedBodyParam('identifier');
        $password = $request->getParsedBodyParam('password');

        if (empty($identifier) || empty($password)) {
            throw new HttpBadRequestException($request, "Insufficient credentials provided.");
        }

        try {
            $user = User::fromLogin($identifier, $password);
        } catch (ModelNotFoundException) {
            throw new HttpUnauthorizedException($request, "Wrong credentials provided.");
        }

        $result = $user->serialize(User::SERIALIZE_SESSION);

        $result['token'] = Auth\JWT::generateToken($user);
        if (Config::getEnv() === 'test') {
            $result['token'] = '__FAKE-TOKEN__';
        }

        return $response->withJson($result, StatusCode::STATUS_OK);
    }

    public function logout(Request $request, Response $response): ResponseInterface
    {
        $redirectUrl = (string) Config::getBaseUri()
            ->withPath('/login');

        try {
            return $this->auth->logout($redirectUrl);
        } catch (AuthException) {
            $this->flash->add(FlashType::ERROR->value, 'logout-failed');
            $redirectUrl = (string) Config::getBaseUri();
            return $response->withRedirect($redirectUrl);
        }
    }
}
