<?php
declare(strict_types=1);

namespace Loxya\Services\Auth;

use Carbon\CarbonImmutable;
use Firebase\JWT\JWT as JWTCore;
use Firebase\JWT\Key as JWTKey;
use Illuminate\Support\Str;
use Loxya\Config\Config;
use Loxya\Http\Request;
use Loxya\Models\User;
use Loxya\Services\Auth\Contracts\AuthenticatorInterface;

final class JWT implements AuthenticatorInterface
{
    public function isEnabled(): bool
    {
        return true;
    }

    public function getUser(Request $request): ?User
    {
        try {
            $token = $this->fetchToken($request);
            $decoded = $this->decodeToken($token);
        } catch (\RuntimeException | \DomainException) {
            return null;
        }

        if (empty($decoded['user']) || !property_exists($decoded['user'], 'id')) {
            return null;
        }

        return User::find($decoded['user']->id);
    }

    public function clearPersistentData(): void
    {
        $cookieName = Config::get('auth.cookie');
        setcookie($cookieName, '', time() - 42_000, '/');
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    private function fetchToken(Request $request): string
    {
        // - Tente de récupérer le token dans les headers HTTP.
        $headerName = Config::get('httpAuthHeader');
        $header = $request->getHeaderLine(sprintf('HTTP_%s', strtoupper(Str::snake($headerName))));
        if (!empty($header)) {
            if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
                return $matches[1];
            }
        }

        if (!$request->isApi()) {
            // - Sinon tente de récupérer le token dans les cookies.
            $cookieName = Config::get('auth.cookie');
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
        $key = new JWTKey(Config::get('JWTSecret'), 'HS256');
        $decoded = JWTCore::decode($token, $key);
        return (array) $decoded;
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes "helpers" statiques
    // -
    // ------------------------------------------------------

    public static function generateToken(User $user): string
    {
        $now = CarbonImmutable::now();
        $expires = $now->addHours(Config::get('sessionExpireHours'));

        $payload = [
            'iat' => $now->getTimeStamp(),
            'exp' => $expires->getTimeStamp(),
            'user' => $user->toArray(),
        ];

        $secret = Config::get('JWTSecret');
        return JWTCore::encode($payload, $secret, 'HS256');
    }

    public static function registerSessionToken(User $user): string
    {
        $token = static::generateToken($user);

        $cookieName = Config::get('auth.cookie');
        setcookie($cookieName, $token, 0, '/');

        return $token;
    }
}
