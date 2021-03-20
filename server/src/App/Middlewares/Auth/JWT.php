<?php
declare(strict_types=1);

namespace Robert2\API\Middlewares\Auth;

use Firebase\JWT\JWT as JWTCore;
use Tuupola\Middleware\JwtAuthentication;
use Monolog\Logger;
use Monolog\Handler\RotatingFileHandler;

use Robert2\API\Config\Config;
use Robert2\API\Config\Acl;

class JWT
{
    public static function generateToken(array $user, int $duration = 2): string
    {
        $now     = new \DateTime();
        $expires = new \DateTime(sprintf('now +%d hours', $duration));

        $payload = [
            "iat"  => $now->getTimeStamp(),
            "exp"  => $expires->getTimeStamp(),
            "user" => $user
        ];

        $secret = Config::getSettings('JWTSecret');

        return JWTCore::encode($payload, $secret, "HS256");
    }

    /**
     * Inits and returns the JwtAuthentication Middleware
     * @codeCoverageIgnore
     */
    public static function init(): JwtAuthentication
    {
        $settings = Config::getSettings();

        $headerName = sprintf(
            'HTTP_%s',
            strtoupper(snake_case($settings['httpAuthHeader']))
        );

        $logger = new Logger('slim');
        $rotating = new RotatingFileHandler(VAR_FOLDER . DS . 'logs' . DS . 'JWTauth', 0, Logger::DEBUG);
        $logger->pushHandler($rotating);

        return new JwtAuthentication([
            'secure'    => $settings['useHTTPS'],
            'secret'    => $settings['JWTSecret'],
            'header'    => $headerName,
            'cookie'    => $settings['httpAuthHeader'],
            'attribute' => Config::getSettings('JWTAttributeName'),
            'path'      => ['/api'],
            'ignore'    => Acl::PUBLIC_ROUTES,
            "logger"    => $logger,
            'error'     => function ($response, $args) {
                $response = $response
                    ->withHeader('Access-Control-Allow-Origin', '*')
                    ->withHeader(
                        'Access-Control-Allow-Headers',
                        'X-Requested-With, Content-Type, Accept, Origin, Authorization'
                    )
                    ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

                $data = [
                    'success' => false,
                    'error'   => [
                        'message' => $args['message'],
                        'details' => null,
                    ],
                ];
                return $response->withJson($data, ERROR_UNAUTHORIZED);
            },
        ]);
    }
}
