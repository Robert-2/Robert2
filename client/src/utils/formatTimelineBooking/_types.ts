import type {
    BookingEntity,
    BookingExcerpt,
    BookingSummary,
} from '@/stores/api/bookings';

export type BookingContext<
    Entity extends BookingEntity = BookingEntity,
    IsExcerpt extends boolean = boolean,
> = (
    IsExcerpt extends true
        ? {
            isExcerpt: IsExcerpt,
            booking: BookingExcerpt<Entity>,
            quantity: number | undefined,
        }
        : {
            isExcerpt: IsExcerpt,
            booking: BookingSummary<Entity>,
            quantity: number | undefined,
        }
);
