import requester from '@/globals/requester';

import type { ProgressCalback } from 'axios';
import type { PaginatedData, PaginationParams } from '@/stores/api/@types';
import type { BaseEvent } from '@/stores/api/events';
import type { Category } from '@/stores/api/categories';
import type { Park } from '@/stores/api/parks';
import type { Tag } from '@/stores/api/tags';
import type { Document } from '@/stores/api/documents';

//
// - Types
//

export type MaterialAttribute = {
    id: number,
    name: string,
    type: 'boolean' | 'string' | 'number' | 'date',
    value: boolean | string | number | null,
};

/* eslint-disable @typescript-eslint/naming-convention */
export type Material = {
    id: number,
    name: string,
    description: string,
    reference: string,
    park_id: Park['id'],
    category_id: Category['id'],
    sub_category_id: number,
    rental_price: number,
    stock_quantity: number,
    remaining_quantity?: number,
    out_of_order_quantity: number | null,
    replacement_price: number,
    is_hidden_on_bill: boolean,
    is_discountable: boolean,
    tags: [],
    attributes: MaterialAttribute[],
};

export type MaterialEventWithPivot = BaseEvent & {
    parks: Array<Park['id']>,
    pivot: {
        id: number,
        material_id: Material['id'],
        event_id: BaseEvent['id'],
        quantity: number,
    },
};

type MaterialEditAttribute = {
    id: MaterialAttribute['id'],
    value: string,
};

export type MaterialEdit = {
    name: string,
    picture?: File | null,
    reference: string,
    description: string,
    park_id: Park['id'],
    category_id: Category['id'],
    sub_category_id: number | null,
    rental_price: string,
    stock_quantity: string,
    out_of_order_quantity: string,
    replacement_price: string,
    is_hidden_on_bill: boolean,
    is_discountable: boolean,
    tags?: Array<Tag['id']>,
    attributes?: MaterialEditAttribute[],
};
/* eslint-enable @typescript-eslint/naming-convention */

type GetAllParams = {
    deleted?: boolean,
};

type GetAllPaginated = GetAllParams & PaginationParams & { paginated?: true };
type GetAllRaw = GetAllParams & { paginated: false };

//
// - Fonctions
//

/* eslint-disable func-style */
async function all(params: GetAllRaw): Promise<Material[]>;
async function all(params: GetAllPaginated): Promise<PaginatedData<Material[]>>;
async function all(params: GetAllPaginated | GetAllRaw): Promise<unknown> {
    return (await requester.get('/materials', { params })).data;
}
/* eslint-enable func-style */

const allWhileEvent = async (eventId: BaseEvent['id']): Promise<Material[]> => (
    (await requester.get(`/materials/while-event/${eventId}`)).data
);

const one = async (id: Material['id']): Promise<Material> => (
    (await requester.get(`/materials/${id}`)).data
);

const create = async (data: MaterialEdit, onProgress?: ProgressCalback): Promise<Material> => (
    (await requester.post('/materials', data, { onProgress })).data
);

const update = async (id: Material['id'], data: MaterialEdit, onProgress?: ProgressCalback): Promise<Material> => (
    (await requester.put(`/materials/${id}`, data, { onProgress })).data
);

const restore = async (id: Material['id']): Promise<void> => {
    await requester.put(`/materials/restore/${id}`);
};

const remove = async (id: Material['id']): Promise<void> => {
    await requester.delete(`/materials/${id}`);
};

const events = async (id: Material['id']): Promise<MaterialEventWithPivot[]> => (
    (await requester.get(`/materials/${id}/events`)).data
);

const documents = async (id: Material['id']): Promise<Document[]> => (
    (await requester.get(`/materials/${id}/documents`)).data
);

const attachDocuments = async (id: Material['id'], files: File[], onProgress?: ProgressCalback): Promise<void> => {
    const formData = new FormData();
    files.forEach((file: File, index: number) => {
        formData.append(`file-${index}`, file);
    });

    await requester.post(`/materials/${id}/documents`, formData, { onProgress });
};

export default {
    all,
    allWhileEvent,
    one,
    create,
    update,
    restore,
    remove,
    events,
    documents,
    attachDocuments,
};
