import requester from '@/globals/requester';

import type { Country } from '@/stores/api/countries';
import type { PaginatedData, ListingParams } from './@types';

//
// - Types
//

export type Company = {
    id: number,
    legal_name: string | null,
    phone: string | null,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: Country['id'] | null,
    country: Country | null,
    full_address: string | null,
    note: string | null,
};

export type CompanyEdit = {
    legal_name: string,
    phone: string | null,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: Country['id'] | null,
    note: string | null,
};

type GetAllParams = ListingParams & { deleted?: boolean };

//
// - Fonctions
//

const all = async (params: GetAllParams): Promise<PaginatedData<Company[]>> => (
    (await requester.get('/companies', { params })).data
);

const one = async (id: Company['id']): Promise<Company> => (
    (await requester.get(`/companies/${id}`)).data
);

const create = async (data: CompanyEdit): Promise<Company> => (
    (await requester.post('/companies', data)).data
);

const update = async (id: Company['id'], data: CompanyEdit): Promise<Company> => (
    (await requester.put(`/companies/${id}`, data)).data
);

export default { all, one, create, update };
