import moment from 'moment';
import { BookingEntity } from '@/stores/api/bookings';

import type { BookingSummary } from '@/stores/api/bookings';

const getTimelineBookingClassNames = (booking: BookingSummary, now: number = Date.now()): string[] => {
    const {
        start_date: startDate,
        end_date: endDate,
        is_archived: isArchived,
        has_missing_materials: hasMissingMaterials,
        is_return_inventory_done: isReturnInventoryDone,
        has_not_returned_materials: hasNotReturnedMaterials,
    } = booking;
    const isOngoing = moment(now).isBetween(startDate, endDate, 'day', '[]');
    const isPast = moment(endDate).isBefore(now, 'day');

    // - Si c'est une réservation, elle est automatiquement confirmée.
    const isConfirmed = booking.entity === BookingEntity.EVENT
        ? booking.is_confirmed
        : true;

    const classNames = ['timeline-event'];

    if (isPast) {
        classNames.push('timeline-event--past');

        if (isConfirmed && !isReturnInventoryDone) {
            classNames.push('timeline-event--no-return-inventory');
        }
    }

    if (isArchived) {
        classNames.push('timeline-event--archived');
    }

    if (isOngoing) {
        classNames.push('timeline-event--in-progress');
    }

    if (!isConfirmed) {
        classNames.push('timeline-event--not-confirmed');
    }

    const hasWarnings = (
        // - Si le booking est en cours ou à venir et qu'il manque du matériel.
        (!isPast && hasMissingMaterials) ||

        // - Si le booking est passé et qu'il a du matériel manquant.
        (isPast && !isArchived && hasNotReturnedMaterials)
    );
    if (hasWarnings) {
        classNames.push('timeline-event--with-warning');
    }

    return classNames;
};

export default getTimelineBookingClassNames;
