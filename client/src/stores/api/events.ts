import requester from '@/globals/requester';

import type { WithCount } from '@/stores/api/@types';
import type { Beneficiary } from '@/stores/api/beneficiaries';
import type { Technician } from '@/stores/api/technicians';
import type { Material } from '@/stores/api/materials';
import type { Estimate } from '@/stores/api/estimates';
import type { Bill } from '@/stores/api/bills';
import type { User } from '@/stores/api/users';
import type { Moment } from 'moment';

//
// - Types
//

type PersonWithPivot<T extends Beneficiary | Technician> = T & {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pivot: { event_id: Event['id'], person_id: T['id'] },
};

type MaterialWithPivot = Material & {
    /* eslint-disable @typescript-eslint/naming-convention */
    pivot: {
        id: number,
        event_id: Event['id'],
        material_id: Material['id'],
        quantity: number,
    },
    /* eslint-enable @typescript-eslint/naming-convention */
};

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
    beneficiaries: Array<PersonWithPivot<Beneficiary>>,
    technicians: Array<PersonWithPivot<Technician>>,
    materials: MaterialWithPivot[],
    estimates: Estimate[],
    bills: Bill[],
    user_id: User['id'] | null,
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
// - Fonctions
//

const search = async (params: SearchParams): Promise<WithCount<EventSummary[]>> => (
    (await requester.get(`/events`, { params })).data
);

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

const remove = async (id: Event['id']): Promise<void> => {
    await requester.delete(`/events/${id}`);
};

export default { search, one, setConfirmed, setArchived, setReturn, terminate, remove };
