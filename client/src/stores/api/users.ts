import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types';
import type { Group } from '@/stores/api/groups';
import type { Park } from '@/stores/api/parks';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
export type User = {
    id: number,
    group: Group,
    pseudo: string,
    email: string,
    first_name: string,
    last_name: string,
    full_name: string,
    phone: string,
};

export type UserDetails = User & {
    restricted_parks: Array<Park['id']>,
};

export type UserEdit = {
    first_name: string | null,
    last_name: string | null,
    pseudo: string,
    email: string,
    phone: string | null,
    password?: string,
    group: Group,
};

type UserEditSelf = Omit<UserEdit, 'group' | 'restricted_parks'>;
/* eslint-enable @typescript-eslint/naming-convention */

type GetAllParams = PaginationParams & { deleted?: boolean };

//
// - Fonctions
//

const all = async (params: GetAllParams): Promise<PaginatedData<User[]>> => (
    (await requester.get('/users', { params })).data
);

const one = async (id: User['id'] | 'self'): Promise<UserDetails> => (
    (await requester.get(`/users/${id}`)).data
);

const create = async (data: UserEdit): Promise<UserDetails> => (
    (await requester.post('/users', data)).data
);

/* eslint-disable func-style */
async function update(id: 'self', data: UserEditSelf): Promise<UserDetails>;
async function update(id: User['id'], data: UserEdit): Promise<UserDetails>;
async function update(id: User['id'] | 'self', data: UserEdit | UserEditSelf): Promise<UserDetails> {
    return (await requester.put(`/users/${id}`, data)).data;
}
/* eslint-enable func-style */

const restore = async (id: User['id']): Promise<UserDetails> => (
    (await requester.put(`/users/restore/${id}`)).data
);

const remove = async (id: User['id']): Promise<void> => {
    await requester.delete(`/users/${id}`);
};

export default { all, one, create, update, restore, remove };
