/* eslint-disable camelcase */

import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types';

//
// - Types
//

export type MaterialAttribute = {
    id: number,
    name: string,
    type: 'boolean' | 'string' | 'number' | 'date',
    value: boolean | string | number | null,
};

export type Material = {
    id: number,
    name: string,
    description: string,
    reference: string,
    park_id: number,
    category_id: number,
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

export type MaterialWithPivot = Material & {
    pivot: {
        id: number,
        event_id?: number,
        material_id: number,
        quantity: number,
    },
};

type GetAllParams = {
    deleted?: boolean,
};

type GetAllPaginated = GetAllParams & PaginationParams & { paginated?: true };
type GetAllRaw = GetAllParams & { paginated: false };

//
// - Functions
//

async function all(params: GetAllRaw): Promise<Material[]>;
async function all(params: GetAllPaginated): Promise<PaginatedData<Material[]>>;
// eslint-disable-next-line func-style
async function all(params: GetAllPaginated | GetAllRaw): Promise<unknown> {
    return (await requester.get('materials', { params })).data;
}

const allWhileEvent = async (eventId: number): Promise<Material[]> => {
    if (!eventId) {
        throw new Error(`Missing event id to fetch concurrent material of.`);
    }
    return (await requester.get(`materials/while-event/${eventId}`)).data;
};

export default { all, allWhileEvent };
