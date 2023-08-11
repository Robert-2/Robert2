<?php
declare(strict_types=1);

namespace Loxya\Observers;

use Loxya\Models\Beneficiary;

final class BeneficiaryObserver
{
    public $afterCommit = true;

    public function deleted(Beneficiary $beneficiary)
    {
        //
        // - Suppression de la Person associée au bénéficiaire si elle n'est
        //   pas utilisée ailleurs (utilisateur ou technicien)
        //

        if ($beneficiary->isForceDeleting()) {
            $beneficiary->person->deleteIfOrphan();
        }
    }
}
