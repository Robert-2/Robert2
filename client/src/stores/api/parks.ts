import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
export type Park = {
    id: number,
    name: string,
    opening_hours: string | null,
    total_items: number,
    total_stock_quantity: number,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: number | null,
    note: string | null,
};

export type ParkEdit = {
    name: string,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: number | null,
    opening_hours: string | null,
    note: string | null,
};

export type ParkDetails = Park & {
    has_ongoing_event: boolean,
};
/* eslint-enable @typescript-eslint/naming-convention */

export type ParkSummary = {
    id: Park['id'],
    name: Park['name'],
};

export type ParkTotalAmountResult = {
    id: Park['id'],
    totalAmount: number,
};

type GetAllParams = PaginationParams & { deleted?: boolean };

//
// - Fonctions
//

const all = async (params: GetAllParams): Promise<PaginatedData<Park[]>> => (
    (await requester.get('/parks', { params })).data
);

const list = async (): Promise<ParkSummary[]> => (
    (await requester.get('/parks/list')).data
);

const one = async (id: Park['id']): Promise<ParkDetails> => (
    (await requester.get(`/parks/${id}`)).data
);

const totalAmount = async (id: Park['id']): Promise<ParkTotalAmountResult['totalAmount']> => {
    const { data } = (await requester.get<ParkTotalAmountResult>(`/parks/${id}/total-amount`));
    return data.totalAmount;
};

const create = async (data: ParkEdit): Promise<ParkDetails> => (
    (await requester.post('/parks', data)).data
);

const update = async (id: Park['id'], data: ParkEdit): Promise<ParkDetails> => (
    (await requester.put(`/parks/${id}`, data)).data
);

const restore = async (id: Park['id']): Promise<ParkDetails> => (
    (await requester.put(`/parks/restore/${id}`)).data
);

const remove = async (id: Park['id']): Promise<void> => {
    await requester.delete(`/parks/${id}`);
};

export default {
    all,
    list,
    one,
    create,
    update,
    totalAmount,
    restore,
    remove,
};
