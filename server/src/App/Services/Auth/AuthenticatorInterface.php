<?php
declare(strict_types=1);

namespace Robert2\API\Services\Auth;

use Robert2\API\Http\Request;
use Robert2\API\Models\User;

interface AuthenticatorInterface
{
    public function getUser(Request $request): ?User;
    public function logout(bool $full): bool;
}
