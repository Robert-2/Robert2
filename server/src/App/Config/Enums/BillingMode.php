<?php
declare(strict_types=1);

namespace Loxya\Config\Enums;

/** Mode de facturation de l'application. */
enum BillingMode: string
{
    /**
     * Mode "Location".
     *
     * La facturation est toujours activée dans les
     * événements et réservations.
     */
    case ALL = 'all';

    /**
     * Mode hybride: Location et prêt.
     *
     * La facturation peut être activée ou désactivée manuellement
     * dans les événements et réservations.
     */
    case PARTIAL = 'partial';

    /**
     * Mode "Prêt".
     *
     * La facturation est toujours désactivée dans les
     * événements et réservations.
     */
    case NONE = 'none';
}
