<?php
declare(strict_types=1);

namespace Robert2\API\Services\Auth;

use Firebase\JWT\JWT as JWTCore;
use Firebase\JWT\Key as JWTKey;
use Illuminate\Support\Str;
use Robert2\API\Config\Config;
use Robert2\API\Http\Request;
use Robert2\API\Models\User;

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

    public function logout(bool $full = true): bool
    {
        return static::clearRegisteredToken();
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    private function fetchToken(Request $request): string
    {
        // - Tente de récupérer le token dans les headers HTTP.
        $headerName = $this->settings['httpAuthHeader'];
        $header = $request->getHeaderLine(sprintf('HTTP_%s', strtoupper(Str::snake($headerName))));
        if (!empty($header)) {
            if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
                return $matches[1];
            }
        }

        if (!$request->isApi()) {
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
            $key = new JWTKey($this->settings['JWTSecret'], 'HS256');
            $decoded = JWTCore::decode($token, $key);
            return (array) $decoded;
        } catch (\Exception $exception) {
            throw $exception;
        }
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes publiques statiques
    // -
    // ------------------------------------------------------

    public static function generateToken(User $user): string
    {
        $duration = Config::getSettings()['sessionExpireHours'];
        $expires = new \DateTime(sprintf('now +%d hours', $duration));

        $payload = [
            'iat' => (new \DateTime())->getTimeStamp(),
            'exp' => $expires->getTimeStamp(),
            'user' => $user->toArray(),
        ];

        $secret = Config::getSettings('JWTSecret');
        return JWTCore::encode($payload, $secret, 'HS256');
    }

    public static function registerToken(User $user, $forceSessionOnly = false): string
    {
        $settings = Config::getSettings();
        $token = static::generateToken($user);

        $expireTime = 0;
        if (!$forceSessionOnly) {
            $expireHours = Config::getSettings()['sessionExpireHours'];
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

    public static function clearRegisteredToken(): bool
    {
        $cookieName = Config::getSettings()['auth']['cookie'];
        return setcookie($cookieName, '', time() - 42000, '/');
    }
}
