import requester from '@/globals/requester';

import type { Company } from '@/stores/api/companies';
import type { Country } from '@/stores/api/countries';
import type { PaginatedData, PaginationParams } from './@types';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
export type Beneficiary = {
    id: number,
    first_name: string,
    full_name: string,
    last_name: string,
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
};

export type BeneficiaryEdit = {
    first_name: string,
    last_name: string,
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

const all = async (params: GetAllParams): Promise<PaginatedData<Beneficiary[]>> => (
    (await requester.get('/beneficiaries', { params })).data
);

const one = async (id: Beneficiary['id']): Promise<Beneficiary> => (
    (await requester.get(`/beneficiaries/${id}`)).data
);

const create = async (data: BeneficiaryEdit): Promise<Beneficiary> => (
    (await requester.post('/beneficiaries', data)).data
);

const update = async (id: Beneficiary['id'], data: BeneficiaryEdit): Promise<Beneficiary> => (
    (await requester.put(`/beneficiaries/${id}`, data)).data
);

const restore = async (id: Beneficiary['id']): Promise<Beneficiary> => (
    (await requester.put(`/beneficiaries/restore/${id}`)).data
);

const remove = async (id: Beneficiary['id']): Promise<void> => {
    await requester.delete(`/beneficiaries/${id}`);
};

export default { all, one, create, update, restore, remove };
