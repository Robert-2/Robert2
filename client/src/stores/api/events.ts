import requester from '@/globals/requester';

import type { WithCount } from '@/stores/api/@types';
import type { Beneficiary } from '@/stores/api/beneficiaries';
import type { Technician } from '@/stores/api/technicians';
import type { Material } from '@/stores/api/materials';
import type { Estimate } from '@/stores/api/estimates';
import type { Bill } from '@/stores/api/bills';
import type { User } from '@/stores/api/users';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
type MaterialWithPivot = Material & {
    pivot: {
        id: number,
        event_id: Event['id'],
        material_id: Material['id'],
        quantity: number,
    },
};

export type BaseEvent = {
    id: number,
    title: string,
    start_date: string,
    end_date: string,
    location: string | null,
    is_confirmed: boolean,
    is_return_inventory_done: boolean,
};

export type Event = BaseEvent & {
    reference: string | null,
    description: string | null,
    is_billable: boolean,
    beneficiaries: Beneficiary[],
    technicians: Technician[],
    materials: MaterialWithPivot[],
    estimates: Estimate[],
    bills: Bill[],
    user_id: User['id'] | null,
    user: User | null,
    created_at: string,
    updated_at: string,
} & (
    | {
        is_archived: true,
        has_missing_materials: null,
        has_not_returned_materials: null,
    }
    | {
        is_archived: false,
        has_missing_materials: boolean | null,
        has_not_returned_materials: boolean | null,
    }
);
/* eslint-enable @typescript-eslint/naming-convention */

export type EventSummary = Pick<Event, (
    | 'id'
    | 'title'
    | 'start_date'
    | 'end_date'
    | 'location'
)>;

type GetAllInPeriodParams = {
    start: string,
    end: string,
};

type SearchParams = {
    search: string,
    exclude?: number | undefined,
};

//
// - Fonctions
//

/* eslint-disable func-style */
async function all(params: GetAllInPeriodParams): Promise<EventSummary[]>;
async function all(params: SearchParams): Promise<WithCount<EventSummary[]>>;
async function all(params: SearchParams | GetAllInPeriodParams): Promise<EventSummary[] | WithCount<EventSummary[]>> {
    return (await requester.get('/events', { params })).data;
}
/* eslint-enable func-style */

const one = async (id: Event['id']): Promise<Event> => (
    (await requester.get(`/events/${id}`)).data
);

const setConfirmed = async (id: Event['id'], isConfirmed: boolean): Promise<Event> => (
    (await requester.put(`/events/${id}`, { is_confirmed: isConfirmed })).data
);

const setArchived = async (id: Event['id'], isArchived: boolean): Promise<Event> => (
    (await requester.put(`/events/${id}`, { is_archived: isArchived })).data
);

const setReturn = async (id: Event['id'], quantities: any): Promise<Event> => (
    (await requester.put(`/events/${id}/return`, quantities)).data
);

const terminate = async (id: Event['id'], quantities: any): Promise<Event> => (
    (await requester.put(`/events/${id}/terminate`, quantities)).data
);

const update = async (id: Event['id'], params: any): Promise<Event> => (
    (await requester.put(`/events/${id}`, params)).data
);

const remove = async (id: Event['id']): Promise<void> => {
    await requester.delete(`/events/${id}`);
};

export default {
    all,
    one,
    setConfirmed,
    setArchived,
    setReturn,
    terminate,
    update,
    remove,
};
