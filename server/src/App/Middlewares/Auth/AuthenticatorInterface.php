<?php
declare(strict_types=1);

namespace Robert2\API\Middlewares\Auth;

use Robert2\API\Models\User;
use Slim\Http\Request;

interface AuthenticatorInterface
{
    public function getUser(Request $request): ?User;
}
