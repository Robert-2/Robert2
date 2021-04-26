<?php
declare(strict_types=1);

namespace Robert2\API\Services\Auth;

use Firebase\JWT\JWT as JWTCore;
use Robert2\API\Config\Config;
use Robert2\API\Services\Auth;
use Robert2\API\Models\User;
use Slim\Http\Request;

final class JWT implements AuthenticatorInterface
{
    private $settings;

    public function __construct()
    {
        $this->settings = Config::getSettings();
    }

    public function getUser(Request $request): ?User
    {
        try {
            $token = $this->fetchToken($request);
            $decoded = $this->decodeToken($token);
        } catch (\RuntimeException | \DomainException $exception) {
            return null;
        }

        if (empty($decoded['user']) || !property_exists($decoded['user'], 'id')) {
            return null;
        }

        return User::find($decoded['user']->id);
    }

    public function logout(): bool
    {
        $cookieName = $this->settings['auth']['cookie'];
        return setcookie($cookieName, '', time() - 42000, '/');
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    private function fetchToken(Request $request): string
    {
        // - Tente de récupérer le token dans les headers HTTP.
        $headerName = $this->settings['httpAuthHeader'];
        $header = $request->getHeaderLine(sprintf('HTTP_%s', strtoupper(snake_case($headerName))));
        if (!empty($header)) {
            if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
                return $matches[1];
            }
        }

        if (!Auth::isApiRequest($request)) {
            // - Sinon tente de récupérer le token dans les cookies.
            $cookieName = $this->settings['auth']['cookie'];
            $cookieParams = $request->getCookieParams();
            if (isset($cookieParams[$cookieName])) {
                if (preg_match('/Bearer\s+(.*)$/i', $cookieParams[$cookieName], $matches)) {
                    return $matches[1];
                }
                return $cookieParams[$cookieName];
            }
        }

        throw new \RuntimeException("Token introuvable.");
    }

    private function decodeToken(string $token): array
    {
        try {
            $decoded = JWTCore::decode(
                $token,
                $this->settings['JWTSecret'],
                ['HS256', 'HS512', 'HS384']
            );
            return (array) $decoded;
        } catch (\Exception $exception) {
            throw $exception;
        }
    }

    // ------------------------------------------------------
    // -
    // -    Public static methods
    // -
    // ------------------------------------------------------

    public static function generateToken(User $user): string
    {
        $duration = static::getTokenDuration($user) ?: 12;
        $expires = new \DateTime(sprintf('now +%d hours', $duration));

        $payload = [
            'iat'  => (new \DateTime())->getTimeStamp(),
            'exp'  => $expires->getTimeStamp(),
            'user' => $user->toArray()
        ];

        $secret = Config::getSettings('JWTSecret');
        return JWTCore::encode($payload, $secret, "HS256");
    }

    public static function registerToken(User $user, $forceSessionOnly = false): string
    {
        $settings = Config::getSettings();
        $token = static::generateToken($user);

        $expireTime = 0;
        if (!$forceSessionOnly) {
            $expireHours = static::getTokenDuration($user);
            if ($expireHours && $expireHours !== 0) {
                $expireTime = time() + $expireHours * 60 * 60;
            }
        }

        setcookie(
            $settings['auth']['cookie'],
            $token,
            $expireTime,
            '/'
        );

        return $token;
    }

    protected static function getTokenDuration(User $user)
    {
        $settings = Config::getSettings();

        $defaultTokenDuration = $settings['sessionExpireHours'];
        return $user->settings['auth_token_validity_duration'] ?: $defaultTokenDuration;
    }
}
