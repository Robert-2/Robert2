import requester from '@/globals/requester';

import type { Country } from '@/stores/api/countries';
import type { Company } from '@/stores/api/companies';
import type { PaginatedData, PaginationParams } from './@types';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
export type Person = {
    id: number,
    first_name: string,
    full_name: string,
    last_name: string,
    nickname: string | null,
    reference: string | null,
    email: string | null,
    phone: string | null,
    company_id: number | null,
    company: Company | null,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: number | null,
    country: Country | null,
    note: string | null,
    user_id: number | null,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
};

export type PersonEdit = {
    first_name: string,
    last_name: string,
    nickname: string | null,
    reference: string | null,
    email: string | null,
    phone: string | null,
    company_id: number | null,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: number | null,
    note: string | null,
};
/* eslint-enable @typescript-eslint/naming-convention */

type GetAllParams = PaginationParams & { deleted?: boolean };

//
// - Fonctions
//

const all = async (params: GetAllParams): Promise<PaginatedData<Person[]>> => (
    (await requester.get('/persons', { params })).data
);

export default { all };
