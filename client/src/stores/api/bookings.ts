import requester from '@/globals/requester';
import { normalize as normalizeEvent } from '@/stores/api/events';

import type { Moment } from 'moment';
import type { Event, RawEvent } from '@/stores/api/events';
import type { Park } from '@/stores/api/parks';
import type { Material } from '@/stores/api/materials';

//
// - Constants
//

export enum BookingEntity {
    EVENT = 'event',
}

//
// - Types
//

type EventBookingSummary = (
    & Pick<Event, (
        | 'id'
        | 'title'
        | 'reference'
        | 'description'
        | 'start_date'
        | 'end_date'
        | 'color'
        | 'location'
        | 'beneficiaries'
        | 'technicians'
        | 'is_confirmed'
        | 'is_billable'
        | 'is_archived'
        | 'is_return_inventory_done'
        | 'has_missing_materials'
        | 'has_not_returned_materials'
        | 'user_id'
        | 'created_at'
        | 'updated_at'
    )>
    & {
        entity: BookingEntity.EVENT,
        parks: Array<Park['id']>,
    }
);

export type BookingSummary = EventBookingSummary;

type RawEventBooking = RawEvent & {
    entity: BookingEntity.EVENT,
};

type RawBooking = RawEventBooking;

export type EventBooking = Event & {
    entity: BookingEntity.EVENT,
};

type Booking = EventBooking;

export type BookingMaterialQuantity = {
    id: Material['id'],
    quantity: number,
};

type UpdateBookingMaterialsParams = {
    entity: BookingEntity,
    materials: BookingMaterialQuantity[],
};

//
// - Normalizer
//

const normalize = (rawBooking: RawBooking): Booking => {
    const { entity, ...booking } = rawBooking;
    if (entity === BookingEntity.EVENT) {
        return {
            entity: BookingEntity.EVENT,
            ...normalizeEvent(booking as RawEvent),
        };
    }
    throw new Error(`Entity '${entity}' not recognized.`);
};

//
// - Fonctions
//

const all = async (start: Moment, end: Moment): Promise<BookingSummary[]> => {
    const params = {
        start: start.format('YYYY-MM-DD HH:mm:ss'),
        end: end.format('YYYY-MM-DD HH:mm:ss'),
    };
    return (await requester.get('/bookings', { params })).data;
};

const updateMaterials = async (id: BookingSummary['id'], params: UpdateBookingMaterialsParams): Promise<Booking> => (
    normalize((await requester.put(`/bookings/${id}/materials`, params)).data)
);

export default { all, updateMaterials };
