import requester from '@/globals/requester';

import type { Category } from './categories';

//
// - Types
//

type AttributeBase = {
    id: number,
    name: string,
    categories: Category[],
};

export type Attribute = AttributeBase & (
    | { type: 'string', maxLength: number | null }
    | { type: 'integer' | 'float', unit: string | null }
    | { type: 'boolean' | 'date' }
);

export type AttributeEdit = {
    name: string,
    categories: Array<Category['id']>,
};

export type AttributePut = Partial<Omit<AttributeEdit, 'type'>>;

//
// - Functions
//

const all = async (categoryId?: Category['id']): Promise<Attribute[]> => {
    const { data } = await requester.get('/attributes', {
        params: { category: categoryId },
    });
    return data;
};

const post = async (data: AttributeEdit): Promise<Attribute> => (
    (await requester.post('/attributes', data)).data
);

const put = async (id: number, data: AttributePut): Promise<Attribute> => (
    (await requester.put(`/attributes/${id}`, data)).data
);

const remove = async (id: number): Promise<void> => {
    await requester.delete(`/attributes/${id}`);
};

export default { all, post, put, remove };
