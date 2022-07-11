import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types';
import type { Group } from '@/stores/api/groups';
import type { Person } from '@/stores/api/persons';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
export type User = {
    id: number,
    pseudo: string,
    email: string,
    group_id: Group['id'],
    person: Person | null,
};

export type UserEdit = {
    pseudo: string,
    email: string,
    password?: string,
    group_id: Group['id'],
    person: {
        first_name: string | null,
        last_name: string | null,
        nickname: string | null,
        phone: string | null,
        street: string | null,
        postal_code: string | null,
        locality: string | null,
    },
};
/* eslint-enable @typescript-eslint/naming-convention */

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
