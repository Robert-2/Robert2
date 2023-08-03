import requester from '@/globals/requester';
import Decimal from 'decimal.js';
import { normalize as normalizeEstimate } from '@/stores/api/estimates';
import { normalize as normalizeInvoice } from '@/stores/api/invoices';

import type { AxiosRequestConfig as RequestConfig } from 'axios';
import type { WithCount } from '@/stores/api/@types';
import type { Beneficiary } from '@/stores/api/beneficiaries';
import type { Technician } from '@/stores/api/technicians';
import type { Material } from '@/stores/api/materials';
import type { RawEstimate, Estimate } from '@/stores/api/estimates';
import type { RawInvoice, Invoice } from '@/stores/api/invoices';
import type { Document } from '@/stores/api/documents';
import type { User } from '@/stores/api/users';

//
// - Types
//

export type EventMaterial = (
    & Material
    & {
        pivot: {
            quantity: number,
            quantity_missing: number,
            quantity_returned: number,
            quantity_returned_broken: number,
        },
    }
);

export type RawEvent<
    DecimalType extends string | Decimal = string,
    IsBillable extends boolean = boolean,
> = (
    {
        id: number,
        title: string,
        reference: string | null,
        description: string | null,
        start_date: string,
        end_date: string,
        duration: number, // - En jours.
        color: string | null,
        location: string | null,
        total_replacement: DecimalType,
        currency: string,
        beneficiaries: Beneficiary[],
        technicians: Technician[],
        materials: EventMaterial[],
        is_confirmed: boolean,
        is_return_inventory_started: boolean,
        is_return_inventory_done: boolean,
        note: string | null,
        author: User | null,
        created_at: string,
        updated_at: string,
    }
    & (
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
    )
    & (
        IsBillable extends true
            ? {
                is_billable: true,
                estimates: Array<RawEstimate<DecimalType>>,
                invoices: Array<RawInvoice<DecimalType>>,
                degressive_rate: DecimalType,
                discount_rate: DecimalType,
                vat_rate: DecimalType,
                daily_total_without_discount: DecimalType,
                daily_total_discountable: DecimalType,
                daily_total_discount: DecimalType,
                daily_total_without_taxes: DecimalType,
                daily_total_taxes: DecimalType,
                daily_total_with_taxes: DecimalType,
                total_without_taxes: DecimalType,
                total_taxes: DecimalType,
                total_with_taxes: DecimalType,
            }
            : {
                is_billable: false,
            }
    )
);

export type Event<
    IsBillable extends boolean = boolean,
> = RawEvent<Decimal, IsBillable>;

export type EventSummary = Pick<Event, (
    | 'id'
    | 'title'
    | 'start_date'
    | 'end_date'
    | 'location'
)>;

type SearchParams = {
    search?: string,
    exclude?: number | undefined,
};

type EventReturnInventoryMaterial = {
    id: Material['id'],
    actual: number,
    broken: number,
};

type EventReturnInventory = EventReturnInventoryMaterial[];

type EventDuplicatePayload = {
    start_date: string,
    end_date: string,
};

//
// - Normalizer
//

export const normalize = (rawEvent: RawEvent): Event => {
    if (!rawEvent.is_billable) {
        return {
            ...rawEvent,
            total_replacement: new Decimal(rawEvent.total_replacement),
        };
    }

    const {
        estimates: rawEstimates,
        invoices: rawInvoices,
        ...event
    } = rawEvent;

    const invoices = rawInvoices !== undefined
        ? rawInvoices.map(normalizeInvoice)
        : undefined;

    const estimates = rawEstimates !== undefined
        ? rawEstimates.map(normalizeEstimate)
        : undefined;

    return {
        ...event,
        ...(estimates ? { estimates } : undefined),
        ...(invoices ? { invoices } : undefined),
        vat_rate: new Decimal(event.vat_rate),
        degressive_rate: new Decimal(event.degressive_rate),
        discount_rate: new Decimal(event.discount_rate),
        daily_total_without_discount: new Decimal(event.daily_total_without_discount),
        daily_total_discountable: new Decimal(event.daily_total_discountable),
        daily_total_discount: new Decimal(event.daily_total_discount),
        daily_total_without_taxes: new Decimal(event.daily_total_without_taxes),
        daily_total_taxes: new Decimal(event.daily_total_taxes),
        daily_total_with_taxes: new Decimal(event.daily_total_with_taxes),
        total_without_taxes: new Decimal(event.total_without_taxes),
        total_taxes: new Decimal(event.total_taxes),
        total_with_taxes: new Decimal(event.total_with_taxes),
        total_replacement: new Decimal(event.total_replacement),
    } as Event;
};

//
// - Fonctions
//

const all = async (params: SearchParams): Promise<WithCount<EventSummary[]>> => (
    (await requester.get('/events', { params })).data
);

const one = async (id: Event['id']): Promise<Event> => (
    normalize((await requester.get(`/events/${id}`)).data)
);

const missingMaterials = async (id: Event['id']): Promise<EventMaterial[]> => (
    (await requester.get(`/events/${id}/missing-materials`)).data
);

const setConfirmed = async (id: Event['id'], isConfirmed: boolean): Promise<Event> => (
    normalize((await requester.put(`/events/${id}`, { is_confirmed: isConfirmed })).data)
);

const archive = async (id: Event['id']): Promise<Event> => (
    normalize((await requester.put(`/events/${id}/archive`)).data)
);

const unarchive = async (id: Event['id']): Promise<Event> => (
    normalize((await requester.put(`/events/${id}/unarchive`)).data)
);

const updateReturnInventory = async (id: Event['id'], inventory: EventReturnInventory): Promise<Event> => (
    normalize((await requester.put(`/events/${id}/return`, inventory)).data)
);

const finishReturnInventory = async (id: Event['id'], inventory: EventReturnInventory): Promise<Event> => (
    normalize((await requester.put(`/events/${id}/return/finish`, inventory)).data)
);

const createInvoice = async (id: Event['id'], discountRate: number = 0): Promise<Invoice> => (
    normalizeInvoice((await requester.post(`/events/${id}/invoices`, { discountRate })).data)
);

const createEstimate = async (id: Event['id'], discountRate: number = 0): Promise<Estimate> => (
    normalizeEstimate((await requester.post(`/events/${id}/estimates`, { discountRate })).data)
);

const create = async (params: any): Promise<Event> => (
    normalize((await requester.post(`/events`, params)).data)
);

const update = async (id: Event['id'], params: any): Promise<Event> => (
    normalize((await requester.put(`/events/${id}`, params)).data)
);

const duplicate = async (id: Event['id'], data: EventDuplicatePayload): Promise<Event> => (
    normalize((await requester.post(`/events/${id}/duplicate`, data)).data)
);

const remove = async (id: Event['id']): Promise<void> => {
    await requester.delete(`/events/${id}`);
};

const documents = async (id: Event['id']): Promise<Document[]> => (
    (await requester.get(`/events/${id}/documents`)).data
);

const attachDocument = async (id: Event['id'], file: File, options: RequestConfig = {}): Promise<Document> => {
    const formData = new FormData(); formData.append('file', file);
    return (await requester.post(`/events/${id}/documents`, formData, options)).data;
};

export default {
    all,
    one,
    missingMaterials,
    setConfirmed,
    archive,
    unarchive,
    updateReturnInventory,
    finishReturnInventory,
    createInvoice,
    createEstimate,
    create,
    duplicate,
    update,
    remove,
    documents,
    attachDocument,
};
