import requester from '@/globals/requester';

import type { Country } from '@/stores/api/countries';
import type { PaginatedData, PaginationParams } from './@types';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
export type Person = {
    id: number,
    first_name: string,
    last_name: string,
    full_name: string,
    email: string | null,
    phone: string | null,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: number | null,
    country: Country | null,
    full_address: string | null,
    user_id: number | null,
};
/* eslint-enable @typescript-eslint/naming-convention */

//
// - Fonctions
//

const all = async (params: PaginationParams): Promise<PaginatedData<Person[]>> => (
    (await requester.get('/persons', { params })).data
);

export default { all };
