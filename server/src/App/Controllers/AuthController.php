<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Config\Config;
use Robert2\API\Http\Enums\AppContext;
use Robert2\API\Http\Request;
use Robert2\API\Models\User;
use Robert2\API\Services\Auth;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Http\Response;

class AuthController extends BaseController
{
    /** @var Auth */
    protected $auth;

    /** @var array */
    private $settings;

    public function __construct(Container $container, Auth $auth)
    {
        parent::__construct($container);

        $this->auth = $auth;
        $this->settings = $container->get('settings');
    }

    public function getSelf(Request $request, Response $response): Response
    {
        $user = Auth::user()->serialize(User::SERIALIZE_DETAILS);

        return $response->withJson($user, StatusCode::STATUS_OK);
    }

    public function loginWithForm(Request $request, Response $response): Response
    {
        $identifier = $request->getParsedBodyParam('identifier');
        $password = $request->getParsedBodyParam('password');
        $context = $request->getParsedBodyParam('context', AppContext::INTERNAL);

        if (empty($identifier) || empty($password)) {
            throw new HttpBadRequestException($request, "Insufficient credentials provided.");
        }

        try {
            $user = User::fromLogin($identifier, $password);
        } catch (ModelNotFoundException $e) {
            throw new HttpUnauthorizedException($request, "Wrong credentials provided.");
        }

        $result = $user->serialize(User::SERIALIZE_DETAILS);

        $result['token'] = Auth\JWT::generateToken($user);
        if (Config::getEnv() === 'test') {
            $result['token'] = '__FAKE-TOKEN__';
        }

        return $response->withJson($result, StatusCode::STATUS_OK);
    }

    public function logout(Request $request, Response $response)
    {
        $contextBasePath = '';

        if (!$this->auth->logout()) {
            // TODO: Passer un message d'erreur au client (lorsqu'on aura un moyen de le faire)
            //       l'informant du fait qu'il n'a pas été complètement déconnecté.
            return $response->withRedirect(sprintf('%s/', $contextBasePath));
        }

        return $response->withRedirect(sprintf('%s/login', $contextBasePath));
    }
}
