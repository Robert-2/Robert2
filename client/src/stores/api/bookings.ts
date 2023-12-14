import requester from '@/globals/requester';
import { normalize as normalizeEvent } from '@/stores/api/events';

import type { Moment } from 'moment';
import type { Event, RawEvent } from '@/stores/api/events';
import type { Park } from '@/stores/api/parks';
import type { Material } from '@/stores/api/materials';
import type { Category } from '@/stores/api/categories';

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
        | 'duration'
        | 'color'
        | 'location'
        | 'beneficiaries'
        | 'technicians'
        | 'is_confirmed'
        | 'is_billable'
        | 'is_archived'
        | 'is_departure_inventory_done'
        | 'is_return_inventory_done'
        | 'has_missing_materials'
        | 'has_not_returned_materials'
        | 'created_at'
        | 'updated_at'
    )>
    & {
        entity: BookingEntity.EVENT,
        parks: Array<Park['id']>,
        categories: Array<Category['id']>,
    }
);

export type BookingSummary = EventBookingSummary;

type RawBooking = (
    | (RawEvent & { entity: BookingEntity.EVENT })
);

export type Booking = (
    | (Event & { entity: BookingEntity.EVENT })
);

export type MaterialQuantity = {
    id: Material['id'],
    quantity: number,
};

//
// - Normalizer
//

const normalize = (rawBooking: RawBooking): Booking => {
    const { entity, ...booking } = rawBooking;

    switch (entity) {
        case BookingEntity.EVENT:
            return {
                entity: BookingEntity.EVENT,
                ...normalizeEvent(booking as RawEvent),
            };

        default:
            throw new Error(`Entity '${entity}' not recognized.`);
    }
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

const updateMaterials = async (entity: BookingEntity, id: BookingSummary['id'], materials: MaterialQuantity[]): Promise<Booking> => (
    normalize((await requester.put(`/bookings/${entity}/${id}/materials`, materials)).data)
);

export default {
    all,
    updateMaterials,
};
