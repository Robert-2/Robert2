import config from '@/globals/config';
import requester from '@/globals/requester';

import type { Person, PersonEdit } from './persons';
import type { PaginatedData, PaginationParams } from './@types';

//
// - Types
//

export type Beneficiary = Omit<Person, 'nickname'>;
export type BeneficiaryEdit = Omit<PersonEdit, 'nickname'>;

type GetAllParams = PaginationParams & { deleted?: boolean };

//
// - Fonctions
//

const all = async (params: GetAllParams): Promise<PaginatedData<Beneficiary[]>> => {
    const _params = { ...params, tags: [config.beneficiaryTagName] };
    return (await requester.get('/persons', { params: _params })).data;
};

const one = async (id: Beneficiary['id']): Promise<Beneficiary> => (
    (await requester.get(`/persons/${id}`)).data
);

const create = async (data: BeneficiaryEdit): Promise<Beneficiary> => {
    const _data = { ...data, tags: [config.beneficiaryTagName] };
    return (await requester.post('/persons', _data)).data;
};

const update = async (id: Beneficiary['id'], data: BeneficiaryEdit): Promise<Beneficiary> => (
    (await requester.put(`/persons/${id}`, data)).data
);

const restore = async (id: Beneficiary['id']): Promise<void> => {
    await requester.put(`/persons/restore/${id}`);
};

const remove = async (id: Beneficiary['id']): Promise<void> => {
    await requester.delete(`/persons/${id}`);
};

export default { all, one, create, update, restore, remove };
