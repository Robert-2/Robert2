<?php
declare(strict_types=1);

namespace Robert2\API\Services\Auth;

use Robert2\API\Models\User;
use Slim\Http\ServerRequest as Request;

interface AuthenticatorInterface
{
    public function getUser(Request $request): ?User;
    public function logout(): bool;
}
