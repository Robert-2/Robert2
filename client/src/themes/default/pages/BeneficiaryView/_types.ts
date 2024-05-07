import type { BookingExcerpt, BookingSummary } from '@/stores/api/bookings';

export type LazyBooking<F extends boolean = boolean> = (
    F extends true
        ? { isComplete: true, booking: BookingSummary }
        : { isComplete: false, booking: BookingExcerpt }
);
