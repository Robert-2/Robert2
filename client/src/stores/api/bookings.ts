import { z } from '@/utils/validation';
import requester from '@/globals/requester';
import { BeneficiarySchema } from './beneficiaries';
import { withPaginationEnvelope } from './@schema';
import {
    EventTechnicianSchema,
    createEventDetailsSchema,
} from './events';

import type Period from '@/utils/period';
import type { Material, UNCATEGORIZED } from '@/stores/api/materials';
import type { Category } from '@/stores/api/categories';
import type { Park } from '@/stores/api/parks';
import type { SchemaInfer } from '@/utils/validation';
import type { ZodRawShape } from 'zod';
import type {
    PaginatedData,
    SortableParams,
    PaginationParams,
} from './@types';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

export enum BookingEntity {
    EVENT = 'event',
}

//
// - Schemas principaux
//

// - Booking excerpt schema.
export const BookingExcerptSchema = z.strictObject({
    id: z.number(),
    entity: z.literal(BookingEntity.EVENT),
    title: z.string(),
    location: z.string().nullable(),
    color: z.string().nullable(),
    mobilization_period: z.period(),
    operation_period: z.period(),
    beneficiaries: z.lazy(() => BeneficiarySchema.array()),
    technicians: z.lazy(() => EventTechnicianSchema.array()),
    is_confirmed: z.boolean(),
    is_archived: z.boolean(),
    is_departure_inventory_done: z.boolean(),
    is_return_inventory_done: z.boolean(),
    has_not_returned_materials: z.boolean().nullable(),
    categories: z.number().array(), // - Ids des catégories liés.
    parks: z.number().array(), // - Ids des parcs liés.
    created_at: z.datetime(),
});

// - Booking summary schema.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createBookingSummarySchema = <T extends ZodRawShape>(augmentation: T) => (
    z
        .strictObject({
            id: z.number(),
            entity: z.literal(BookingEntity.EVENT),
            title: z.string(),
            reference: z.string().nullable(),
            description: z.string().nullable(),
            location: z.string().nullable(),
            color: z.string().nullable(),
            mobilization_period: z.period(),
            operation_period: z.period(),
            beneficiaries: z.lazy(() => BeneficiarySchema.array()),
            technicians: z.lazy(() => EventTechnicianSchema.array()),
            is_confirmed: z.boolean(),
            is_billable: z.boolean(),
            is_archived: z.boolean(),
            is_departure_inventory_done: z.boolean(),
            is_return_inventory_done: z.boolean(),
            has_missing_materials: z.boolean().nullable(),
            has_not_returned_materials: z.boolean().nullable(),
            categories: z.number().array(), // - Ids des catégories liés.
            parks: z.number().array(), // - Ids des parcs liés.
            created_at: z.datetime(),
        })
        .extend<T>(augmentation)
);
export const BookingSummarySchema = createBookingSummarySchema({});

// - Booking schema.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createBookingSchema = <T extends ZodRawShape>(augmentation: T) => (
    z.lazy(() => (
        createEventDetailsSchema({
            entity: z.literal(BookingEntity.EVENT),
            ...augmentation,
        })
    ))
);
export const BookingSchema = createBookingSchema({});

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

//
// - Main Types
//

type NarrowBooking<Schema, Entity extends BookingEntity> = (
    Extract<Schema, { entity: Entity }>
);

export type BookingExcerpt<Entity extends BookingEntity = BookingEntity> = (
    NarrowBooking<SchemaInfer<typeof BookingExcerptSchema>, Entity>
);

export type BookingSummary<Entity extends BookingEntity = BookingEntity> = (
    NarrowBooking<SchemaInfer<typeof BookingSummarySchema>, Entity>
);

export type Booking<Entity extends BookingEntity = BookingEntity> = (
    NarrowBooking<SchemaInfer<typeof BookingSchema>, Entity>
);

//
// - Édition
//

export type MaterialQuantity = {
    id: Material['id'],
    quantity: number,
};

//
// - Récupération
//

export type BookingListFilters = {
    period?: Period,
    search?: string,
    category?: Category['id'] | typeof UNCATEGORIZED,
    park?: Park['id'],
    endingToday?: boolean,
    returnInventoryTodo?: boolean,
    archived?: boolean,
    notConfirmed?: boolean,
};

type GetAllParamsPaginated = BookingListFilters & SortableParams & PaginationParams & { paginated?: true };
type GetAllInPeriodParams = { paginated: false, period: Period };

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

async function all(params: GetAllInPeriodParams): Promise<BookingExcerpt[]>;
async function all(params?: GetAllParamsPaginated): Promise<PaginatedData<BookingExcerpt[]>>;
async function all({ period, ...params }: GetAllParamsPaginated | GetAllInPeriodParams = {}): Promise<unknown> {
    const normalizedParams = { paginated: true, ...params, ...period?.toQueryParams('period') };
    const response = await requester.get('/bookings', { params: normalizedParams });

    return normalizedParams.paginated
        ? withPaginationEnvelope(BookingExcerptSchema).parse(response.data)
        : BookingExcerptSchema.array().parse(response.data);
}

const oneSummary = async (entity: BookingEntity, id: Booking['id']): Promise<BookingSummary> => {
    const response = await requester.get(`/bookings/${entity}/${id}/summary`);
    return BookingSummarySchema.parse(response.data);
};

const updateMaterials = async (entity: BookingEntity, id: Booking['id'], materials: MaterialQuantity[]): Promise<Booking> => {
    const response = await requester.put(`/bookings/${entity}/${id}/materials`, materials);
    return BookingSchema.parse(response.data);
};

export default {
    all,
    oneSummary,
    updateMaterials,
};
