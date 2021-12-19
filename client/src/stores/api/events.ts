import requester from '@/globals/requester';

import type { WithCount } from '@/stores/api/@types';
import type { PersonWithEventPivot } from '@/stores/api/persons';
import type { MaterialWithPivot } from '@/stores/api/materials';
import type { Estimate } from '@/stores/api/estimates';
import type { Bill } from '@/stores/api/bills';
import type { User } from '@/stores/api/users';
import type { Moment } from 'moment';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
export type BaseEvent = {
    id: number,
    title: string,
    start_date: string,
    end_date: string,
    location: string | null,
    reference: string | null,
    description: string | null,
    is_billable: boolean,
    is_confirmed: boolean,
    is_return_inventory_done: boolean,
    beneficiaries: PersonWithEventPivot[],
    technicians: PersonWithEventPivot[],
    materials: MaterialWithPivot[],
    estimates: Estimate[],
    bills: Bill[],
    user_id: number | null,
    user: User | null,
    created_at: string,
    deleted_at: string,
    updated_at: string,
};

export type Event = BaseEvent & (
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

export type FormatedEvent = Event & {
    startDate: Moment,
    endDate: Moment,
    isCurrent: boolean,
    isPast: boolean,
    isConfirmed: boolean,
    isInventoryDone: boolean,
    isArchived: boolean,
    hasMissingMaterials: boolean,
    hasNotReturnedMaterials: boolean,
};

export type EventSummary = {
    id: number,
    title: string,
    startDate: string,
    endDate: string,
    location: string | null,
};

type SearchParams = {
    search: string,
    exclude?: number | undefined,
};

//
// - Functions
//

const search = async (params: SearchParams): Promise<WithCount<EventSummary[]>> => (
    (await requester.get(`events`, { params })).data
);

const one = async (id: number): Promise<Event> => (
    (await requester.get(`events/${id}`)).data
);

const setConfirmed = async (id: number, isConfirmed: boolean): Promise<Event> => (
    (await requester.put(`events/${id}`, { is_confirmed: isConfirmed })).data
);

const setArchived = async (id: number, isArchived: boolean): Promise<Event> => (
    (await requester.put(`events/${id}`, { is_archived: isArchived })).data
);

const remove = async (id: number): Promise<void> => {
    await requester.delete(`events/${id}`);
};

export default { search, one, setConfirmed, setArchived, remove };
