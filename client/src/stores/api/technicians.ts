import { z } from '@/utils/validation';
import requester from '@/globals/requester';
import { CountrySchema } from './countries';
import { DocumentSchema } from './documents';
import { EventSchema } from './events';
import { withPaginationEnvelope } from './@schema';

import type Period from '@/utils/period';
import type { Event } from './events';
import type { SchemaInfer } from '@/utils/validation';
import type { AxiosRequestConfig as RequestConfig } from 'axios';
import type { PaginatedData, SortableParams, PaginationParams } from './@types';
import type { Document } from './documents';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

//
// - Schemas secondaires
//

export const TechnicianEventSchema = z.strictObject({
    id: z.number(),
    event_id: z.number(),
    technician_id: z.number(),
    period: z.period(), // FIXME
    position: z.string().nullable(),
    event: z.lazy(() => EventSchema),
});

//
// - Schemas principaux
//

export const TechnicianSchema = z.strictObject({
    id: z.number(),
    user_id: z.number().nullable(),
    first_name: z.string(),
    last_name: z.string(),
    full_name: z.string(),
    nickname: z.string().nullable(),
    // TODO [zod@>3.22.4]: Remettre `email()`.
    email: z.string().nullable(),
    phone: z.string().nullable(),
    street: z.string().nullable(),
    postal_code: z.string().nullable(),
    locality: z.string().nullable(),
    country_id: z.number().nullable(),
    country: z.lazy(() => CountrySchema).nullable(),
    full_address: z.string().nullable(),
    note: z.string().nullable(),
});

export const TechnicianWithEventsSchema = TechnicianSchema.extend({
    events: TechnicianEventSchema.array(),
});

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type Technician = SchemaInfer<typeof TechnicianSchema>;

export type TechnicianEvent = SchemaInfer<typeof TechnicianEventSchema>;
export type TechnicianWithEvents = SchemaInfer<typeof TechnicianWithEventsSchema>;

//
// - Edition
//

export type TechnicianEdit = {
    first_name: string,
    last_name: string,
    nickname: string | null,
    email: string | null,
    phone: string | null,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: number | null,
    note: string | null,
};

//
// - Récupération
//

export type Filters = {
    search?: string,
    availabilityPeriod?: Period,
};

type GetAllParams = (
    & Filters
    & SortableParams
    & PaginationParams
    & { deleted?: boolean }
);

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

const all = async ({ availabilityPeriod, ...otherParams }: GetAllParams = {}): Promise<PaginatedData<Technician[]>> => {
    const params: Record<string, unknown> = Object.assign(otherParams, {
        ...availabilityPeriod?.toQueryParams('availabilityPeriod'),
    });
    const response = await requester.get('/technicians', { params });
    return withPaginationEnvelope(TechnicianSchema).parse(response.data);
};

const allWhileEvent = async (eventId: Event['id']): Promise<TechnicianWithEvents[]> => {
    const response = await requester.get(`/technicians/while-event/${eventId}`);
    return TechnicianWithEventsSchema.array().parse(response.data);
};

const one = async (id: Technician['id']): Promise<Technician> => {
    const response = await requester.get(`/technicians/${id}`);
    return TechnicianSchema.parse(response.data);
};

const create = async (data: TechnicianEdit): Promise<Technician> => {
    const response = await requester.post('/technicians', data);
    return TechnicianSchema.parse(response.data);
};

const update = async (id: Technician['id'], data: TechnicianEdit): Promise<Technician> => {
    const response = await requester.put(`/technicians/${id}`, data);
    return TechnicianSchema.parse(response.data);
};

const restore = async (id: Technician['id']): Promise<Technician> => {
    const response = await requester.put(`/technicians/restore/${id}`);
    return TechnicianSchema.parse(response.data);
};

const remove = async (id: Technician['id']): Promise<void> => {
    await requester.delete(`/technicians/${id}`);
};

const assignments = async (id: Technician['id']): Promise<TechnicianEvent[]> => {
    const response = await requester.get(`/technicians/${id}/events`);
    return TechnicianEventSchema.array().parse(response.data);
};

const documents = async (id: Technician['id']): Promise<Document[]> => {
    const response = await requester.get(`/technicians/${id}/documents`);
    return DocumentSchema.array().parse(response.data);
};

const attachDocument = async (id: Technician['id'], file: File, options: RequestConfig = {}): Promise<Document> => {
    const formData = new FormData(); formData.append('file', file);
    const response = await requester.post(`/technicians/${id}/documents`, formData, options);
    return DocumentSchema.parse(response.data);
};

export default {
    all,
    allWhileEvent,
    one,
    create,
    update,
    remove,
    restore,
    assignments,
    documents,
    attachDocument,
};
