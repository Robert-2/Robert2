<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Slim\Http\Request;

trait AuthUser
{
    protected function _getAuthUserData(Request $request): array
    {
        if (isTestMode()) {
            return ['id' => 1];
        }

        $jwt = $request->getAttribute($this->container->settings['JWTAttributeName']);
        if (empty($jwt['user'])) {
            throw new \InvalidArgumentException("Auth user not found in JWT data.");
        }

        return (array)$jwt['user'];
    }
}
