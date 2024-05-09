<?php
declare(strict_types=1);

namespace Loxya\Models\Enums;

/**
 * Modes d'affichage des bookings (événements ou réservations).
 */
enum BookingViewMode: string
{
    /** Vue sous forme de calendrier (timeline). */
    case CALENDAR = 'calendar';

    /** Vue sous forme de liste paginée. */
    case LISTING = 'listing';
}
