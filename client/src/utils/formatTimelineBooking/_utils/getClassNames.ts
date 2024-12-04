import { BookingEntity } from '@/stores/api/bookings';

import type DateTime from '@/utils/datetime';
import type { BookingContext } from '../_types';

const getTimelineBookingClassNames = (context: BookingContext, now: DateTime): string[] => {
    const { isExcerpt, booking } = context;
    const isOngoing = now.isBetween(booking.mobilization_period);
    const isPast = booking.mobilization_period.isBefore(now);
    const isFuture = !booking.mobilization_period.isBeforeOrDuring(now);
    const {
        is_archived: isArchived,
        is_return_inventory_done: isReturnInventoryDone,
        has_not_returned_materials: hasNotReturnedMaterials,
    } = booking;

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
        (isFuture && !isExcerpt && booking.has_missing_materials) ||

        // - Si le booking est passé et qu'il a du matériel non retourné.
        (isPast && !isArchived && hasNotReturnedMaterials)
    );
    if (hasWarnings) {
        classNames.push('timeline-event--with-warning');
    }

    return classNames;
};

export default getTimelineBookingClassNames;
