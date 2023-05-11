import requester from '@/globals/requester';

import type { AxiosRequestConfig as RequestConfig } from 'axios';
import type { PaginatedData, ListingParams } from '@/stores/api/@types';
import type { Country } from '@/stores/api/countries';
import type { Document } from '@/stores/api/documents';
import type { Event } from './events';

//
// - Types
//

export type Technician = {
    id: number,
    first_name: string,
    full_name: string,
    last_name: string,
    nickname: string | null,
    email: string | null,
    phone: string | null,
    full_address: string | null,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: number | null,
    country: Country | null,
    note: string | null,
    user_id: number | null, // => user.id, etc.
};

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

type GetAllParams = ListingParams & { deleted?: boolean };

//
// - Fonctions
//

const all = async (params: GetAllParams): Promise<PaginatedData<Technician[]>> => (
    (await requester.get('/technicians', { params })).data
);

const allWhileEvent = async (eventId: Event['id']): Promise<Technician[]> => (
    (await requester.get(`/technicians/while-event/${eventId}`)).data
);

const one = async (id: Technician['id']): Promise<Technician> => (
    (await requester.get(`/technicians/${id}`)).data
);

const create = async (data: TechnicianEdit): Promise<Technician> => (
    (await requester.post('/technicians', data)).data
);

const update = async (id: Technician['id'], data: TechnicianEdit): Promise<Technician> => (
    (await requester.put(`/technicians/${id}`, data)).data
);

const restore = async (id: Technician['id']): Promise<Technician> => (
    (await requester.put(`/technicians/restore/${id}`)).data
);

const remove = async (id: Technician['id']): Promise<void> => {
    await requester.delete(`/technicians/${id}`);
};

const documents = async (id: Technician['id']): Promise<Document[]> => (
    (await requester.get(`/technicians/${id}/documents`)).data
);

const attachDocument = async (id: Technician['id'], file: File, options: RequestConfig = {}): Promise<Document> => {
    const formData = new FormData(); formData.append('file', file);
    return (await requester.post(`/technicians/${id}/documents`, formData, options)).data;
};

export default {
    all,
    allWhileEvent,
    one,
    create,
    update,
    remove,
    restore,
    documents,
    attachDocument,
};
