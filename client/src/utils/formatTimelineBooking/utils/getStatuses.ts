import moment from 'moment';
import { BookingEntity } from '@/stores/api/bookings';

import type { I18nTranslate } from 'vuex-i18n';
import type { Booking } from '@/stores/api/bookings';

type Status = { icon: string, label: string };

const getTimelineBookingStatuses = (booking: Booking, __: I18nTranslate, now: number = Date.now()): Status[] => {
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

    const getStatusText = (status: string): string => {
        switch (booking.entity) {
            case BookingEntity.EVENT:
                return __(`@event.statuses.${status}`);

            default:
                throw new Error(`Unsupported entity ${(booking as any).entity}`);
        }
    };

    const statuses = [];

    if (isPast && hasNotReturnedMaterials) {
        statuses.push({
            icon: 'exclamation-triangle',
            label: getStatusText('has-not-returned-materials'),
        });
    }

    if (isArchived) {
        statuses.push({
            icon: 'archive',
            label: getStatusText('is-archived'),
        });
        return statuses;
    }

    if (booking.entity === BookingEntity.EVENT && isPast && !isConfirmed) {
        statuses.push({
            icon: 'history',
            label: getStatusText('is-past'),
        });
    }

    if (booking.entity === BookingEntity.EVENT && !isPast && !isConfirmed) {
        statuses.push({
            icon: 'question',
            label: getStatusText('is-not-confirmed'),
        });
    }

    if (isOngoing) {
        statuses.push({
            icon: 'running',
            label: getStatusText('is-currently-running'),
        });
    }

    if (booking.entity === BookingEntity.EVENT && isConfirmed) {
        statuses.push({
            icon: isPast ? 'lock' : 'check',
            label: isPast
                ? getStatusText('is-locked')
                : getStatusText('is-confirmed'),
        });
    }

    if (!isPast && hasMissingMaterials) {
        statuses.push({
            icon: 'exclamation-triangle',
            label: getStatusText('has-missing-materials'),
        });
    }

    if (isPast && !isReturnInventoryDone) {
        statuses.push({
            icon: 'exclamation-triangle',
            label: getStatusText('needs-its-return-inventory'),
        });
    }

    return statuses;
};

export default getTimelineBookingStatuses;
