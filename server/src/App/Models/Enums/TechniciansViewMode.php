<?php
declare(strict_types=1);

namespace Loxya\Models\Enums;

/**
 * Modes d'affichage de la page des techniciens.
 */
enum TechniciansViewMode: string
{
    /** Vue sous forme de timeline. */
    case TIMELINE = 'timeline';

    /** Vue en liste. */
    case LISTING = 'listing';
}
