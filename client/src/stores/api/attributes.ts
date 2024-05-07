import { z } from '@/utils/validation';
import requester from '@/globals/requester';
import { CategorySchema } from './categories';

import type { Category } from './categories';
import type { SchemaInfer } from '@/utils/validation';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

export enum AttributeType {
    STRING = 'string',
    INTEGER = 'integer',
    FLOAT = 'float',
    BOOLEAN = 'boolean',
    DATE = 'date',
}

const AttributeBaseSchema = z.strictObject({
    id: z.number(),
    name: z.string(),
});

// NOTE: Pour le moment, pas moyen de faire ça mieux en gardant l'objet `strict`.
// @see https://github.com/colinhacks/zod/discussions/3011#discussioncomment-7718731
export const AttributeSchema = z.discriminatedUnion('type', [
    AttributeBaseSchema.extend({
        type: z.literal(AttributeType.STRING),
        max_length: z.number().nullable(),
    }),
    AttributeBaseSchema.extend({
        type: z.enum([AttributeType.INTEGER, AttributeType.FLOAT]),
        unit: z.string().nullable(),
        is_totalisable: z.boolean().nullable().transform(
            (value: boolean | null) => value ?? false,
        ),
    }),
    AttributeBaseSchema.extend({
        type: z.literal(AttributeType.BOOLEAN),
    }),
    AttributeBaseSchema.extend({
        type: z.literal(AttributeType.DATE),
    }),
]);

// NOTE: Pour le moment, pas moyen de faire ça mieux en gardant l'objet `strict`.
// @see https://github.com/colinhacks/zod/discussions/3011#discussioncomment-7718731
export const AttributeWithValueSchema = z.discriminatedUnion('type', [
    AttributeBaseSchema.extend({
        type: z.literal(AttributeType.STRING),
        max_length: z.number().nullable(),
        value: z.string().nullable(),
    }),
    AttributeBaseSchema.extend({
        type: z.enum([AttributeType.INTEGER, AttributeType.FLOAT]),
        unit: z.string().nullable(),
        is_totalisable: z.boolean().nullable().transform(
            (value: boolean | null) => value ?? false,
        ),
        value: z.number().nullable(),
    }),
    AttributeBaseSchema.extend({
        type: z.literal(AttributeType.BOOLEAN),
        value: z.boolean().nullable(),
    }),
    AttributeBaseSchema.extend({
        type: z.literal(AttributeType.DATE),
        value: z.day().nullable(),
    }),
]);

// NOTE: Pour le moment, pas moyen de faire ça mieux en gardant l'objet `strict`.
// @see https://github.com/colinhacks/zod/discussions/3011#discussioncomment-7718731
export const AttributeDetailsSchema = (() => {
    const baseSchema = AttributeBaseSchema.extend({
        categories: z.lazy(() => CategorySchema.array()),
    });

    return z.discriminatedUnion('type', [
        baseSchema.extend({
            type: z.literal(AttributeType.STRING),
            max_length: z.number().nullable(),
        }),
        baseSchema.extend({
            type: z.enum([AttributeType.INTEGER, AttributeType.FLOAT]),
            unit: z.string().nullable(),
            is_totalisable: z.boolean().nullable().transform(
                (value: boolean | null) => value ?? false,
            ),
        }),
        baseSchema.extend({
            type: z.enum([AttributeType.BOOLEAN, AttributeType.DATE]),
        }),
    ]);
})();

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type Attribute = SchemaInfer<typeof AttributeSchema>;

export type AttributeWithValue = SchemaInfer<typeof AttributeWithValueSchema>;

export type AttributeDetails = SchemaInfer<typeof AttributeDetailsSchema>;

//
// - Edition
//

export type AttributeCreate = {
    name: string,
    type?: AttributeType,
    unit?: string,
    max_length?: string | number | null,
    is_totalisable?: boolean,
    categories: Array<Category['id']>,
};

export type AttributeEdit = Omit<AttributeCreate, 'type'>;

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

const all = async (categoryId?: Category['id'] | 'none'): Promise<AttributeDetails[]> => {
    const params = { ...(categoryId !== undefined ? { category: categoryId } : {}) };
    const response = await requester.get('/attributes', { params });
    return AttributeDetailsSchema.array().parse(response.data);
};

const one = async (id: Attribute['id']): Promise<AttributeDetails> => {
    const response = await requester.get(`/attributes/${id}`);
    return AttributeDetailsSchema.parse(response.data);
};

const create = async (data: AttributeCreate): Promise<AttributeDetails> => {
    const response = await requester.post('/attributes', data);
    return AttributeDetailsSchema.parse(response.data);
};

const update = async (id: Attribute['id'], data: AttributeEdit): Promise<AttributeDetails> => {
    const response = await requester.put(`/attributes/${id}`, data);
    return AttributeDetailsSchema.parse(response.data);
};

const remove = async (id: Attribute['id']): Promise<void> => {
    await requester.delete(`/attributes/${id}`);
};

export default { all, one, create, update, remove };
