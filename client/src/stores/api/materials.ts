import requester from '@/globals/requester';
import { z } from '@/utils/validation';
import { TagSchema } from './tags';
import { DocumentSchema } from './documents';
import { AttributeWithValueSchema } from './attributes';
import { createBookingSummarySchema } from './bookings';
import { withPaginationEnvelope } from './@schema';

import type Period from '@/utils/period';
import type { ProgressCallback, AxiosRequestConfig as RequestConfig } from 'axios';
import type { PaginatedData, SortableParams, PaginationParams } from './@types';
import type { Park } from './parks';
import type { Category } from './categories';
import type { Event } from './events';
import type { SubCategory } from './subcategories';
import type { Attribute } from './attributes';
import type { Tag } from './tags';
import type { Document } from './documents';
import type { SchemaInfer } from '@/utils/validation';
import type { ZodRawShape } from 'zod';
import type { Simplify } from 'type-fest';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

/** Représente le matériel non catégorisés. */
export const UNCATEGORIZED = 'uncategorized';

//
// - Schemas secondaires
//

const MaterialBaseSchema = z.strictObject({
    id: z.number(),
    name: z.string(),
    reference: z.string(),
    picture: z.string().nullable(),
    description: z.string().nullable(),
    category_id: z.number().nullable(),
    sub_category_id: z.number().nullable(),
    rental_price: z.decimal().nullable().optional(),
    replacement_price: z.decimal().nullable(),
    stock_quantity: z.number().nullable().transform(
        (value: number | null): number => value ?? 0,
    ),
    out_of_order_quantity: z.number().nullable().transform(
        (value: number | null): number => value ?? 0,
    ),
    park_id: z.number(),
    is_hidden_on_bill: z.boolean().optional(),
    is_discountable: z.boolean().optional(),
    is_reservable: z.boolean(),
    attributes: z.lazy(() => AttributeWithValueSchema.array()),
    tags: z.lazy(() => TagSchema.array()),
    note: z.string().nullable(),
    created_at: z.datetime(),
    updated_at: z.datetime().nullable(),
});

const createMaterialSchemaFactory = <T extends ZodRawShape>(augmentation: T) => (
    <InnerT extends ZodRawShape>(innerAugmentation: InnerT) => (
        MaterialBaseSchema
            .extend<T>(augmentation)
            .extend<InnerT>(innerAugmentation)
    )
);

export const createMaterialSchema = createMaterialSchemaFactory({});

export const createMaterialDetailsSchema = createMaterialSchemaFactory({});

export const createMaterialWithAvailabilitySchema = createMaterialSchemaFactory(
    { available_quantity: z.number() },
);

const MaterialBookingSummarySchema = z.lazy(() => (
    createBookingSummarySchema({
        pivot: z.strictObject({
            quantity: z.number().positive(),
        }),
    })
));

//
// - Schemas principaux
//

export const MaterialSchema = createMaterialSchema({});

export const MaterialDetailsSchema = createMaterialDetailsSchema({});

export const MaterialWithAvailabilitySchema = createMaterialWithAvailabilitySchema({});

export const MaterialPublicSchema = (() => {
    const baseSchema = MaterialBaseSchema.extend({
        available_quantity: z.number(),
    });

    return baseSchema.pick({
        id: true,
        name: true,
        description: true,
        picture: true,
        available_quantity: true,
        rental_price: true,
    });
})();

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type Material = SchemaInfer<typeof MaterialSchema>;

export type MaterialDetails = SchemaInfer<typeof MaterialDetailsSchema>;

export type MaterialWithAvailability = SchemaInfer<typeof MaterialWithAvailabilitySchema>;

export type MaterialPublic = SchemaInfer<typeof MaterialPublicSchema>;

//
// - Secondary types.
//

export type MaterialBookingSummary = SchemaInfer<typeof MaterialBookingSummarySchema>;

//
// - Edition
//

type MaterialEditAttribute = {
    id: Attribute['id'],
    value: string,
};

export type MaterialEdit = {
    name: string,
    picture?: File | null,
    reference: string,
    description: string,
    is_unitary: boolean,
    park_id: Park['id'],
    category_id: Category['id'],
    sub_category_id: SubCategory['id'] | null,
    rental_price: string,
    stock_quantity: string,
    out_of_order_quantity: string,
    replacement_price: string,
    is_hidden_on_bill: boolean,
    is_discountable: boolean,
    is_reservable?: boolean,
    tags?: Array<Tag['id']>,
    attributes?: MaterialEditAttribute[],
};

//
// - Récupération
//

export type BaseFilters = Nullable<{
    search?: string,
    category?: Category['id'],
    subCategory?: SubCategory['id'],
}>;

export type Filters = Simplify<(
    & Omit<BaseFilters, 'category'>
    & Nullable<{
        quantitiesPeriod?: Period,
        category?: Category['id'] | typeof UNCATEGORIZED,
        park?: Park['id'],
        tags?: Array<Tag['id']>,
    }>
)>;

type GetAllParamsBase = Filters & SortableParams & { deleted?: boolean };
type GetAllParamsPaginated = GetAllParamsBase & PaginationParams & { paginated?: true };
type GetAllParamsRaw = GetAllParamsBase & { paginated: false };

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

async function all(params: GetAllParamsRaw): Promise<MaterialWithAvailability[]>;
async function all(params?: GetAllParamsPaginated): Promise<PaginatedData<MaterialWithAvailability[]>>;
async function all({ quantitiesPeriod, ...otherParams }: GetAllParamsPaginated | GetAllParamsRaw = {}): Promise<unknown> {
    const normalizedParams = {
        paginated: true,
        ...otherParams,
        ...quantitiesPeriod?.toQueryParams('quantitiesPeriod'),
    };

    const response = await requester.get('/materials', {
        params: normalizedParams,
    });

    const schema = normalizedParams.paginated
        ? withPaginationEnvelope(MaterialWithAvailabilitySchema)
        : MaterialWithAvailabilitySchema.array();

    return schema.parse(response.data);
}

const allWhileEvent = async (eventId: Event['id']): Promise<MaterialWithAvailability[]> => {
    const response = await requester.get(`/materials/while-event/${eventId}`);
    return MaterialWithAvailabilitySchema.array().parse(response.data);
};

const one = async (id: Material['id']): Promise<MaterialDetails> => {
    const response = await requester.get(`/materials/${id}`);
    return MaterialDetailsSchema.parse(response.data);
};

const create = async (data: MaterialEdit, onProgress?: ProgressCallback): Promise<MaterialDetails> => {
    const response = await requester.post('/materials', data, {
        ...(onProgress ? { onProgress } : {}),
    });
    return MaterialDetailsSchema.parse(response.data);
};

const update = async (id: Material['id'], data: Partial<MaterialEdit>, onProgress?: ProgressCallback): Promise<MaterialDetails> => {
    const response = await requester.put(`/materials/${id}`, data, {
        ...(onProgress ? { onProgress } : {}),
    });
    return MaterialDetailsSchema.parse(response.data);
};

const restore = async (id: Material['id']): Promise<MaterialDetails> => {
    const response = await requester.put(`/materials/${id}/restore`);
    return MaterialDetailsSchema.parse(response.data);
};

const remove = async (id: Material['id']): Promise<void> => {
    await requester.delete(`/materials/${id}`);
};

const bookings = async (id: Material['id'], params?: PaginationParams): Promise<PaginatedData<MaterialBookingSummary[]>> => {
    const config = { ...(params ? { params } : {}) };
    const response = await requester.get(`/materials/${id}/bookings`, config);
    return withPaginationEnvelope(MaterialBookingSummarySchema).parse(response.data);
};

const documents = async (id: Material['id']): Promise<Document[]> => {
    const response = await requester.get(`/materials/${id}/documents`);
    return DocumentSchema.array().parse(response.data);
};

const attachDocument = async (id: Material['id'], file: File, options: RequestConfig = {}): Promise<Document> => {
    const formData = new FormData(); formData.append('file', file);
    const response = await requester.post(`/materials/${id}/documents`, formData, options);
    return DocumentSchema.parse(response.data);
};

export default {
    all,
    allWhileEvent,
    one,
    create,
    update,
    restore,
    remove,
    bookings,
    documents,
    attachDocument,
};
