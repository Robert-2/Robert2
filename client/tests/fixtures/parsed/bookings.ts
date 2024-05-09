import { dataFactory } from '@fixtures/@utils';
import inputBookings from '../bookings';
import {
    BookingExcerptSchema,
    BookingSummarySchema,
    BookingSchema,
} from '@/stores/api/bookings';

import type { FactoryReturnType } from '@fixtures/@utils';
import type {
    BookingExcerpt,
    BookingSummary,
    Booking,
} from '@/stores/api/bookings';

const asExcerpt: FactoryReturnType<BookingExcerpt> = dataFactory(
    BookingExcerptSchema.array().parse(inputBookings.excerpt()),
);

const asSummary: FactoryReturnType<BookingSummary> = dataFactory(
    BookingSummarySchema.array().parse(inputBookings.summary()),
);

const asDefault: FactoryReturnType<Booking> = dataFactory(
    BookingSchema.array().parse(inputBookings.default()),
);

export default {
    excerpt: asExcerpt,
    summary: asSummary,
    default: asDefault,
};
