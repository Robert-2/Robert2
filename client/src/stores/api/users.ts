import requester from '@/globals/requester';

import type { PaginatedData, ListingParams } from '@/stores/api/@types';
import type { Group } from '@/stores/api/groups';

//
// - Types
//

type UserSettings = {
    language: string,
};

export type User = UserSettings & {
    id: number,
    group: Group,
    pseudo: string,
    email: string,
    first_name: string,
    last_name: string,
    full_name: string,
    phone: string | null,
};

export type UserDetails = User;

export type UserEdit = {
    first_name: string | null,
    last_name: string | null,
    pseudo: string,
    email: string,
    phone: string | null,
    password?: string,
    group: Group,
};

type UserSettingsEdit = Partial<UserSettings>;

type UserEditSelf = Omit<UserEdit, 'group'>;

type GetAllParams = ListingParams & {
    deleted?: boolean,
    group?: Group,
};

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

const getSettings = async (id: User['id']): Promise<UserSettings> => (
    (await requester.get(`/users/${id}/settings`)).data
);

const saveSettings = async (id: User['id'], data: UserSettingsEdit): Promise<UserSettings> => (
    (await requester.put(`/users/${id}/settings`, data)).data
);

const restore = async (id: User['id']): Promise<UserDetails> => (
    (await requester.put(`/users/restore/${id}`)).data
);

const remove = async (id: User['id']): Promise<void> => {
    await requester.delete(`/users/${id}`);
};

export default {
    all,
    one,
    create,
    update,
    getSettings,
    saveSettings,
    restore,
    remove,
};
