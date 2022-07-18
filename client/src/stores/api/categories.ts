import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types';
import type { Subcategory } from '@/stores/api/subcategories';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
export type Category = {
    id: number,
    name: string,
    sub_categories: Subcategory[],
    created_at: string,
    updated_at: string,
};
/* eslint-enable @typescript-eslint/naming-convention */

type GetAllPaginated = PaginationParams & { paginated?: true };
type GetAllRaw = { paginated: false };

export type CategoryEdit = {
    name: string,
};

//
// - Fonctions
//

/* eslint-disable func-style */
async function all(params: GetAllRaw): Promise<Category[]>;
async function all(params: GetAllPaginated): Promise<PaginatedData<Category[]>>;
async function all(params: GetAllPaginated | GetAllRaw): Promise<unknown> {
    return (await requester.get('/categories', { params })).data;
}
/* eslint-enable func-style */

const create = async (data: CategoryEdit): Promise<Category> => (
    (await requester.post('/categories', data)).data
);

const update = async (id: Category['id'], data: CategoryEdit): Promise<Category> => (
    (await requester.put(`/categories/${id}`, data)).data
);

const remove = async (id: Category['id']): Promise<void> => {
    await requester.delete(`/categories/${id}`);
};

export default { all, create, update, remove };
