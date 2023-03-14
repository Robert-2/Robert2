import requester from '@/globals/requester';

import type { ProgressCallback } from 'axios';
import type { PaginatedData, ListingParams } from '@/stores/api/@types';
import type { Event } from '@/stores/api/events';
import type { Booking } from '@/stores/api/bookings';
import type { Category } from '@/stores/api/categories';
import type { Subcategory } from '@/stores/api/subcategories';
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
    unit: string | null,
    value: boolean | string | number | null,
};

export type UnitUsedBy = {
    events: number,
    reservations: number,
    listTemplates: number,
};

export type Material = (
    {
        id: number,
        name: string,
        description: string | null,
        reference: string,
        category_id: Category['id'] | null,
        sub_category_id: Subcategory['id'] | null,
        rental_price: number,
        stock_quantity: number,
        out_of_order_quantity: number | null,
        replacement_price: number,
        is_hidden_on_bill: boolean,
        is_discountable: boolean,
        is_reservable: boolean,
        tags: [],
        attributes: MaterialAttribute[],
        created_at: string,
        updated_at: string,
        park_id: Park['id'],
    }
);

export type MaterialDetails = Material;

export type MaterialWithAvailabilities = Material & {
    available_quantity?: number,
};

export type BookingWithPivot = Booking & {
    pivot: {
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
    sub_category_id: Subcategory['id'] | null,
    rental_price: string,
    stock_quantity: string,
    out_of_order_quantity: string,
    replacement_price: string,
    is_hidden_on_bill: boolean,
    is_discountable: boolean,
    is_reservable?: boolean,
    tags?: Array<Tag['id']>,
    attributes?: MaterialEditAttribute[],
};

type GetAllParams = {
    deleted?: boolean,
};

type GetAllPaginated = GetAllParams & ListingParams & { paginated?: true };
type GetAllRaw = GetAllParams & { paginated: false };

//
// - Fonctions
//

/* eslint-disable func-style */
async function all(params: GetAllRaw): Promise<MaterialWithAvailabilities[]>;
async function all(params: GetAllPaginated): Promise<PaginatedData<MaterialWithAvailabilities[]>>;
async function all(params: GetAllPaginated | GetAllRaw): Promise<unknown> {
    return (await requester.get('/materials', { params })).data;
}
/* eslint-enable func-style */

const allWhileEvent = async (eventId: Event['id']): Promise<MaterialWithAvailabilities[]> => (
    (await requester.get(`/materials/while-event/${eventId}`)).data
);

const one = async (id: Material['id']): Promise<MaterialDetails> => (
    (await requester.get(`/materials/${id}`)).data
);

const create = async (data: MaterialEdit, onProgress?: ProgressCallback): Promise<MaterialDetails> => (
    (await requester.post('/materials', data, { onProgress })).data
);

const update = async (id: Material['id'], data: MaterialEdit, onProgress?: ProgressCallback): Promise<MaterialDetails> => (
    (await requester.put(`/materials/${id}`, data, { onProgress })).data
);

const restore = async (id: Material['id']): Promise<MaterialDetails> => (
    (await requester.put(`/materials/${id}/restore`)).data
);

const remove = async (id: Material['id']): Promise<void> => {
    await requester.delete(`/materials/${id}`);
};

const bookings = async (id: Material['id']): Promise<BookingWithPivot[]> => (
    (await requester.get(`/materials/${id}/bookings`)).data
);

const documents = async (id: Material['id']): Promise<Document[]> => (
    (await requester.get(`/materials/${id}/documents`)).data
);

const attachDocuments = async (id: Material['id'], files: File[], onProgress?: ProgressCallback): Promise<void> => {
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
    bookings,
    documents,
    attachDocuments,
};
