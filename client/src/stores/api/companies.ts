/* eslint-disable @typescript-eslint/naming-convention */

import config from '@/globals/config';
import requester from '@/globals/requester';

import type { Country } from '@/stores/api/countries';

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
    note: string | null,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
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

//
// - Fonctions
//

const one = async (id: Company['id']): Promise<Company> => (
    (await requester.get(`/companies/${id}`)).data
);

const create = async (data: CompanyEdit): Promise<Company> => {
    const _data = { ...data, tags: [config.beneficiaryTagName] };
    return (await requester.post('/companies', _data)).data;
};

const update = async (id: Company['id'], data: CompanyEdit): Promise<Company> => (
    (await requester.put(`/companies/${id}`, data)).data
);

export default { one, create, update };
