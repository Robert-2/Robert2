import requester from '@/globals/requester';

import type { Subcategory } from '@/stores/api/subcategories';

//
// - Types
//

export type Category = {
    id: number,
    name: string,
};

export type CategoryDetails = Category & {
    sub_categories: Subcategory[],
};

export type CategoryEdit = {
    name: string,
};

//
// - Fonctions
//

const all = async (): Promise<CategoryDetails[]> => (
    (await requester.get('/categories')).data
);

const create = async (data: CategoryEdit): Promise<CategoryDetails> => (
    (await requester.post('/categories', data)).data
);

const update = async (id: Category['id'], data: CategoryEdit): Promise<CategoryDetails> => (
    (await requester.put(`/categories/${id}`, data)).data
);

const remove = async (id: Category['id']): Promise<void> => {
    await requester.delete(`/categories/${id}`);
};

export default { all, create, update, remove };
