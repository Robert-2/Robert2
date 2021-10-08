/* eslint-disable babel/camelcase */

import requester from '@/globals/requester';

//
// - Types
//

import type { PaginatedData } from '@/globals/types/pagination.d';

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
    out_of_order_quantity: number | null,
    replacement_price: number,
    is_hidden_on_bill: boolean,
    is_discountable: boolean,
    tags: [],
    attributes: MaterialAttribute[],
};

export type MaterialWhileEvent = Material & {
    remaining_quantity: number,
};

export type MaterialWithPivot = Material & {
    pivot: {
        id: number,
        event_id?: number,
        material_id: number,
        quantity: number,
    },
};

//
// - Functions
//

const allWhileEvent = async (eventId: number): Promise<MaterialWhileEvent[]> => {
    if (!eventId) {
        throw new Error(`Missing event id to fetch concurrent material of.`);
    }
    return (await requester.get(`materials/while-event/${eventId}`)).data;
};

const allWithoutPagination = async (): Promise<MaterialWhileEvent[]> => (
    (await requester.get('materials/not-paginated')).data
);

const all = async (): Promise<PaginatedData<Material[]>> => (
    (await requester.get('materials')).data
);

export default { allWhileEvent, allWithoutPagination, all };

/* eslint-enable babel/camelcase */
