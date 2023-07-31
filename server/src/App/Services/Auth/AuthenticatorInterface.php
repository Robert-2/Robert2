<?php
declare(strict_types=1);

namespace Loxya\Services\Auth;

use Loxya\Http\Request;
use Loxya\Models\User;

interface AuthenticatorInterface
{
    public function getUser(Request $request): ?User;
    public function logout(bool $full): bool;
}
