import requester from '@/globals/requester';

import type { Category } from '@/stores/api/categories';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
export type Subcategory = {
    id: number,
    name: string,
    category_id: Category['id'],
};
/* eslint-enable @typescript-eslint/naming-convention */

export type SubcategoryEdit = {
    name: string,
};

export type SubcategoryCreate = SubcategoryEdit & {
    categoryId: Category['id'],
};

//
// - Fonctions
//

const create = async ({ name, categoryId }: SubcategoryCreate): Promise<Subcategory> => (
    (await requester.post('/subcategories', { name, category_id: categoryId })).data
);

const update = async (id: Subcategory['id'], data: SubcategoryEdit): Promise<Subcategory> => (
    (await requester.put(`/subcategories/${id}`, data)).data
);

const remove = async (id: Subcategory['id']): Promise<void> => {
    await requester.delete(`/subcategories/${id}`);
};

export default { create, update, remove };
