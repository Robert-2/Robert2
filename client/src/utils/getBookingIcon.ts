import DateTime from '@/utils/datetime';
import { BookingEntity } from '@/stores/api/bookings';

import type { BookingExcerpt, BookingSummary } from '@/stores/api/bookings';
import type { EventDetails } from '@/stores/api/events';

const BOOKING_INTERNAL_TYPE = Symbol('Booking internal type');

type BookingContext<T extends boolean = boolean> = (
    T extends true
        ? { isExcerpt: true, type: typeof BOOKING_INTERNAL_TYPE, booking: BookingExcerpt }
        : (
            | { isExcerpt: false, type: typeof BOOKING_INTERNAL_TYPE, booking: BookingSummary }
            | { isExcerpt: false, type: BookingEntity.EVENT, booking: EventDetails }
        )
);

function getBookingIconCore(context: BookingContext<false>, now: DateTime): string;
function getBookingIconCore(context: BookingContext, now: DateTime): string | null;
function getBookingIconCore(context: BookingContext, now: DateTime): string | null {
    const { isExcerpt, booking, type } = context;
    const isPast = booking.mobilization_period.isBefore(now);
    const isFuture = !booking.mobilization_period.isBeforeOrDuring(now);
    const {
        is_archived: isArchived,
        is_return_inventory_done: isReturnInventoryDone,
        has_not_returned_materials: hasNotReturnedMaterials,
    } = booking;

    const isConfirmed: boolean = (() => {
        if (type === BookingEntity.EVENT) {
            return booking.is_confirmed;
        }
        if (type === BOOKING_INTERNAL_TYPE && booking.entity === BookingEntity.EVENT) {
            return booking.is_confirmed;
        }
        return true;
    })();

    // - Si le booking est à venir et qu'il manque du matériel.
    //   (ou qu'on si on a pas encore l'info. car c'est un extrait, on retourne `null`)
    if (isFuture) {
        if (isExcerpt) {
            return null;
        }

        if (booking.has_missing_materials) {
            return 'exclamation-triangle';
        }
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
}

//
// - Public Api.
//

/**
 * Permet de récupérer l'icône représentant l'état d'un événement.
 *
 * @param event - L'événement pour lequel on veut obtenir le code de l'icône.
 * @param now - La date à utiliser pour le moment présent (défaut: `DateTime.now()`).
 *
 * @returns - Le code de l'icône représentant l'état de l'événement.
 */
export const getBookingIconFromEvent = (event: EventDetails, now: DateTime = DateTime.now()): string => {
    const context: BookingContext<false> = {
        isExcerpt: false,
        type: BookingEntity.EVENT,
        booking: event,
    };
    return getBookingIconCore(context, now);
};

/**
 * Permet de récupérer l'icône représentant l'état d'un booking.
 *
 * @param booking - Le booking pour lequel on veut obtenir le code de l'icône.
 * @param excerpt - Active le mode "extrait" uniquement. Dans ce mode, qui se
 *                  veut transitoire, certains états ne pouvant être déduits
 *                  retourneront `null` à la place de l'icône (par exemple,
 *                  si le booking n'est pas passé, un loading s'affichera car
 *                  on ne pourra pas connaître l'état "materiel manquant" du booking).
 *                  Seul ce mode accepte un `BookingExcerpt` en entrée.
 * @param now - La date à utiliser pour le moment présent (défaut: `DateTime.now()`).
 *
 * @returns - Le code de l'icône représentant l'état du booking ou `null` si le booking
 *            passé est un extrait (`excerpt` à `true`) et qu'on est dans une situation
 *            ou on ne peut pas déduire de façon certaine l'état du booking sans avoir
 *            le reste des informations.
 */
function getBookingIcon(booking: BookingSummary, excerpt?: false, now?: DateTime): string;
function getBookingIcon(booking: BookingExcerpt, excerpt: boolean, now?: DateTime): string | null;
function getBookingIcon(
    booking: BookingSummary | BookingExcerpt,
    excerpt: boolean = false,
    now: DateTime = DateTime.now(),
): string | null {
    const context: BookingContext = {
        isExcerpt: excerpt,
        type: BOOKING_INTERNAL_TYPE,
        booking: booking as any,
    };
    return getBookingIconCore(context, now);
}

export default getBookingIcon;
