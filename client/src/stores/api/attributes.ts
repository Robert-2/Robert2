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

const post = (data: AttributeEdit): Promise<Attribute> => (
    requester.post('/attributes', data)
);

const put = (id: number, data: AttributePut): Promise<Attribute> => (
    requester.put(`/attributes/${id}`, data)
);

const remove = async (id: number): Promise<void> => {
    await requester.delete(`/attributes/${id}`);
};

export default { all, post, put, remove };
