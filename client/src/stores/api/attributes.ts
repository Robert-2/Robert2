import requester from '@/globals/requester';

import type { Category } from './categories';

//
// - Types
//

type AttributeBase = {
    id: number,
    name: string,
};

export type Attribute = AttributeBase & (
    | { type: 'string', maxLength: number | null }
    | { type: 'integer' | 'float', unit: string | null }
    | { type: 'boolean' | 'date' }
);

export type AttributeDetails = Attribute & {
    categories: Category[],
};

export type AttributeEdit = {
    name: string,
    categories: Array<Category['id']>,
};

export type AttributePut = Partial<Omit<AttributeEdit, 'type'>>;

//
// - Fonctions
//

const all = async (categoryId?: Category['id'] | 'none'): Promise<AttributeDetails[]> => {
    const { data } = await requester.get('/attributes', {
        params: { category: categoryId },
    });
    return data;
};

const create = async (data: AttributeEdit): Promise<AttributeDetails> => (
    (await requester.post('/attributes', data)).data
);

const update = async (id: Attribute['id'], data: AttributePut): Promise<AttributeDetails> => (
    (await requester.put(`/attributes/${id}`, data)).data
);

const remove = async (id: Attribute['id']): Promise<void> => {
    await requester.delete(`/attributes/${id}`);
};

export default { all, create, update, remove };
