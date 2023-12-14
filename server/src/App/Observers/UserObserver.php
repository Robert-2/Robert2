<?php
declare(strict_types=1);

namespace Loxya\Observers;

use Loxya\Models\User;

final class UserObserver
{
    public $afterCommit = true;

    public function deleted(User $user): void
    {
        //
        // - Suppression de la Person associée à l'utilisateur si elle n'est
        //   pas utilisée ailleurs (bénéficiaire ou technicien)
        //

        if ($user->isForceDeleting()) {
            $user->person?->deleteIfOrphan(false);
        }
    }
}
