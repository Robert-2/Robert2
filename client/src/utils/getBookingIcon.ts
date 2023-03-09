import moment from 'moment';
import { BookingEntity } from '@/stores/api/bookings';

import type { Booking } from '@/stores/api/bookings';

/**
 * Permet de récupérer l'icône représentant l'état d'un booking.
 *
 * @param booking - Le booking dont on veut obtenir le code de l'icône.
 * @param now - Le timestamp Unix pour le moment présent (défaut: `Date.now()`).
 *
 * @returns - Le code de l'icône représentant l'état du booking.
 */
const getBookingIcon = (booking: Booking, now: number = Date.now()): string => {
    const isPast = moment(booking.end_date).isBefore(now, 'day');
    const {
        is_archived: isArchived,
        has_missing_materials: hasMissingMaterials,
        is_return_inventory_done: isReturnInventoryDone,
        has_not_returned_materials: hasNotReturnedMaterials,
    } = booking;

    // - Si c'est une réservation, elle est automatiquement confirmée.
    const isConfirmed = booking.entity === BookingEntity.EVENT
        ? booking.is_confirmed
        : true;

    // - Si le booking est en cours ou à venir et qu'il manque du matériel.
    if (!isPast && hasMissingMaterials) {
        return 'exclamation-triangle';
    }

    // - Si le booking est passé et qu'il a du matériel manquant.
    if (isPast && !isArchived && hasNotReturnedMaterials) {
        return 'exclamation-triangle';
    }

    if (isArchived) {
        return 'archive';
    }

    if (!isConfirmed) {
        return 'question';
    }

    // - C'est un booking confirmé, en cours ou futur => Icône "Ok".
    if (!isPast) {
        return 'check';
    }

    // - C'est un booking passé, confirmé et non archivé.
    // => Si son inventaire de retour est fait, il est complet vu un guard plus haut = Icône "Ok".
    // => Si son inventaire de retour n'est pas fait = Icône "En attente / retard".
    return isReturnInventoryDone ? 'check' : 'clock';
};

export default getBookingIcon;
