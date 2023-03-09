import requester from '@/globals/requester';

import type { Moment } from 'moment';
import type { Event } from '@/stores/api/events';
import type { Park } from '@/stores/api/parks';

//
// - Constants
//

export enum BookingEntity {
    EVENT = 'event',
}

//
// - Types
//

export type EventBooking = Event & {
    entity: BookingEntity.EVENT,
    parks: Array<Park['id']>,
};

export type Booking = EventBooking;

//
// - Fonctions
//

const all = async (start: Moment, end: Moment): Promise<Booking[]> => {
    const params = {
        start: start.format('YYYY-MM-DD HH:mm:ss'),
        end: end.format('YYYY-MM-DD HH:mm:ss'),
    };
    return (await requester.get('/bookings', { params })).data;
};

export default { all };
