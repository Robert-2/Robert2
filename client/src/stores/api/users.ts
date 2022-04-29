import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types';
import type { Person } from '@/stores/api/persons';

//
// - Types
//

export type UserGroupId = 'admin' | 'member' | 'visitor';

export type User = {
    /* eslint-disable @typescript-eslint/naming-convention */
    id: number,
    pseudo: string,
    email: string,
    group_id: UserGroupId,
    person: Person | null,
    /* eslint-enable @typescript-eslint/naming-convention */
};

export type UserEdit = {
    /* eslint-disable @typescript-eslint/naming-convention */
    pseudo: string,
    email: string,
    password?: string,
    group_id: UserGroupId,
    person: {
        first_name: string | null,
        last_name: string | null,
        nickname: string | null,
        phone: string | null,
        street: string | null,
        postal_code: string | null,
        locality: string | null,
    },
    /* eslint-enable @typescript-eslint/naming-convention */
};

type GetAllParams = PaginationParams & { deleted?: boolean };

//
// - Fonctions
//

const all = async (params: GetAllParams): Promise<PaginatedData<User[]>> => (
    (await requester.get('/users', { params })).data
);

const one = async (id: User['id']): Promise<User> => (
    (await requester.get(`/users/${id}`)).data
);

const create = async (data: UserEdit): Promise<User> => (
    (await requester.post('/users', data)).data
);

const update = async (id: User['id'], data: UserEdit): Promise<User> => (
    (await requester.put(`/users/${id}`, data)).data
);

const restore = async (id: User['id']): Promise<void> => {
    await requester.put(`/users/restore/${id}`);
};

const remove = async (id: User['id']): Promise<void> => {
    await requester.delete(`/users/${id}`);
};

export default { all, one, create, update, restore, remove };
