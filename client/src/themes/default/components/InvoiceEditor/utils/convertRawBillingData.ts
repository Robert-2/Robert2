import omit from 'lodash/omit';
import uniqueId from 'lodash/uniqueId';
import getEmbeddedBilling from './getEmbeddedBilling';

import type { Booking, BillingData, ExtraBillingData } from '@/stores/api/bookings';
import type { RawBillingData, RawExtraBillingData } from '../_types';

export const convertBookingToRawBillingData = (booking: Booking<true>): RawBillingData => {
    const data = getEmbeddedBilling(booking);

    const extras: RawExtraBillingData[] = data.extras.map(
        (extra: ExtraBillingData): RawExtraBillingData => ({
            _id: extra.id !== null ? extra.id : uniqueId(),
            ...extra,
        }),
    );

    return { ...data, extras };
};

export const convertFromRawBillingData = (rawData: RawBillingData): BillingData => {
    const extras: ExtraBillingData[] = rawData.extras.map(
        (extra: RawExtraBillingData) => omit(extra, ['_id']),
    );

    return { ...rawData, extras };
};
