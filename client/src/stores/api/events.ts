import { z } from '@/utils/validation';
import requester from '@/globals/requester';
import { UserSchema } from './users';
import { MaterialWithContextExcerptSchema } from './materials';
import { DocumentSchema } from './documents';
import { TechnicianSchema } from './technicians';
import { withCountedEnvelope } from './@schema';
import { EstimateSchema } from './estimates';
import { InvoiceSchema } from './invoices';
import {
    BeneficiarySchema,
} from './beneficiaries';

import type Period from '@/utils/period';
import type { ZodRawShape } from 'zod';
import type { CountedData } from './@types';
import type { SchemaInfer } from '@/utils/validation';
import type { Document } from './documents';
import type { Estimate } from './estimates';
import type { Invoice } from './invoices';
import type { Material } from './materials';
import type { Technician } from './technicians';
import type { Beneficiary } from './beneficiaries';
import type { AxiosRequestConfig as RequestConfig } from 'axios';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

//
// - Schemas secondaires
//

export const EventTechnicianSchema = z.strictObject({
    id: z.number(),
    event_id: z.number(),
    technician_id: z.number(),
    period: z.period(),
    position: z.string().nullable(),
    technician: z.lazy(() => TechnicianSchema),
});

const EventTaxSchema = z.strictObject({
    name: z.string(),
    is_rate: z.boolean(),
    value: z.decimal(),
});

const EventTaxTotalSchema = EventTaxSchema
    .extend({ total: z.decimal() });

//
// -- Event material schemas / factory
//

const EventMaterialBaseSchema = z.strictObject({
    id: z.number(), // - Id du matériel.
    name: z.string(),
    reference: z.string(),
    category_id: z.number().nullable(),
    material: z.lazy(() => MaterialWithContextExcerptSchema),
    quantity: z.number().positive(),
    quantity_departed: z.number().nonnegative().nullable(),
    quantity_returned: z.number().nonnegative().nullable(),
    quantity_returned_broken: z.number().nonnegative().nullable(),
    departure_comment: z.string().nullable(),
    unit_replacement_price: z.decimal().nullable(),
    total_replacement_price: z.decimal().nullable(),
});

const createEventMaterialSchemaFactory = <T extends ZodRawShape>(augmentation: T) => (
    <InnerT extends ZodRawShape>(innerAugmentation: InnerT) => (
        EventMaterialBaseSchema
            .extend<T>(augmentation)
            .extend<InnerT>(innerAugmentation)
    )
);

const createMaterialNotBillableSchema = createEventMaterialSchemaFactory({});
const createMaterialBillableSchema = createEventMaterialSchemaFactory({
    unit_price: z.decimal(),
    degressive_rate: z.decimal(),
    unit_price_period: z.decimal(),
    total_without_discount: z.decimal(),
    discount_rate: z.decimal(),
    total_discount: z.decimal(),
    total_without_taxes: z.decimal(),
    taxes: z.lazy(() => EventTaxSchema.array()),
});

// - Matériel d'événement de base.
export const EventMaterialNotBillableSchema = createMaterialNotBillableSchema({});
export const EventMaterialBillableSchema = createMaterialBillableSchema({});
export const EventMaterialSchema = z.union([
    EventMaterialNotBillableSchema,
    EventMaterialBillableSchema,
]);

// - Matériel d'événement avec quantité manquante.
const EventMaterialNotBillableWithQuantityMissingSchema = createMaterialNotBillableSchema({
    quantity_missing: z.number().nonnegative(),
});
const EventMaterialBillableWithQuantityMissingSchema = createMaterialBillableSchema({
    quantity_missing: z.number().nonnegative(),
});
const EventMaterialWithQuantityMissingSchema = z.union([
    EventMaterialBillableWithQuantityMissingSchema,
    EventMaterialNotBillableWithQuantityMissingSchema,
]);

//
// -- Event extra schemas / factories
//

export const EventExtraSchema = z.strictObject({
    id: z.number(),
    description: z.string(),
    quantity: z.number().positive(),
    unit_price: z.decimal(),
    tax_id: z.number().nullable(),
    taxes: z.lazy(() => EventTaxSchema.array()),
    total_without_taxes: z.decimal(),
});

//
// - Schemas principaux
//

export const EventSummarySchema = z.strictObject({
    id: z.number(),
    title: z.string(),
    mobilization_period: z.period(),
    operation_period: z.period(),
    location: z.string().nullable(),
});

export const EventSchema = EventSummarySchema.extend({
    reference: z.string().nullable(),
    description: z.string().nullable(),
    color: z.string().nullable(),
    is_confirmed: z.boolean(),
    is_billable: z.boolean(),
    is_archived: z.boolean(),
    is_departure_inventory_done: z.boolean(),
    is_return_inventory_done: z.boolean(),
    materials_count: z.number().nonnegative(),
    note: z.string().nullable(),
    created_at: z.datetime(),
    updated_at: z.datetime().nullable(),
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createEventDetailsSchema = <T extends ZodRawShape>(augmentation: T) => (
    EventSchema
        .omit({
            is_billable: true,
            is_archived: true,
            is_departure_inventory_done: true,
            is_return_inventory_done: true,
        })
        .extend({
            total_replacement: z.decimal(),
            currency: z.currency(),
            has_deleted_materials: z.boolean(),
            beneficiaries: z.lazy(() => BeneficiarySchema.array()),
            technicians: z.lazy(() => EventTechnicianSchema.array()),
            note: z.string().nullable().optional(),
            author: z.lazy(() => UserSchema).nullable(),
        })
        .extend<T>(augmentation)
        .strip() // TODO: À enlever lorsqu'on pourra garder les objets stricts avec les intersections.
        .and(z.discriminatedUnion('is_departure_inventory_done', [
            z.object({ // TODO: `strictObject` lorsque ce sera possible.
                is_departure_inventory_done: z.literal(true),
                departure_inventory_datetime: z.datetime().nullable(),
                departure_inventory_author: z.lazy(() => UserSchema).nullable(),
            }),
            z.object({ // TODO: `strictObject` lorsque ce sera possible.
                is_departure_inventory_done: z.literal(false),
                departure_inventory_datetime: z.null(),
                departure_inventory_author: z.null(),
            }),
        ]))
        .and(z.discriminatedUnion('is_return_inventory_done', [
            z.object({ // TODO: `strictObject` lorsque ce sera possible.
                is_return_inventory_done: z.literal(true),
                is_return_inventory_started: z.literal(true),
                return_inventory_datetime: z.datetime().nullable(),
                return_inventory_author: z.lazy(() => UserSchema).nullable(),
            }),
            z.object({ // TODO: `strictObject` lorsque ce sera possible.
                is_return_inventory_done: z.literal(false),
                is_return_inventory_started: z.boolean(),
                return_inventory_datetime: z.null(),
                return_inventory_author: z.null(),
            }),
        ]))
        .and(z.discriminatedUnion('is_archived', [
            z.object({ // TODO: `strictObject` lorsque ce sera possible.
                is_archived: z.literal(true),
                has_missing_materials: z.null(),
                has_not_returned_materials: z.null(),
            }),
            z.object({ // TODO: `strictObject` lorsque ce sera possible.
                is_archived: z.literal(false),
                has_missing_materials: z.boolean().nullable(),
                has_not_returned_materials: z.boolean().nullable(),
            }),
        ]))
        .and(z.discriminatedUnion('is_billable', [
            z.object({ // TODO: `strictObject` lorsque ce sera possible.
                is_billable: z.literal(true),
                materials: z.lazy(() => EventMaterialBillableSchema.array()),
                extras: z.lazy(() => EventExtraSchema.array()),
                estimates: z.lazy(() => EstimateSchema.array()).optional(),
                invoices: z.lazy(() => InvoiceSchema.array()).optional(),
                total_without_global_discount: z.decimal(),
                global_discount_rate: z.decimal(),
                total_global_discount: z.decimal(),
                total_without_taxes: z.decimal(),
                total_taxes: z.lazy(() => EventTaxTotalSchema.array()),
                total_with_taxes: z.decimal(),
            }),
            z.object({ // TODO: `strictObject` lorsque ce sera possible.
                is_billable: z.literal(false),
                materials: z.lazy(() => EventMaterialNotBillableSchema.array()),
            }),
        ]))
);

export const EventDetailsSchema = createEventDetailsSchema({});

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

//
// - Main Types
//

type NarrowEvent<Schema, IsBillable extends boolean> =
    IsBillable extends true
        ? Extract<Schema, { is_billable: true }>
        : Extract<Schema, { is_billable: false }>;

export type Event = SchemaInfer<typeof EventSchema>;

export type EventDetails<IsBillable extends boolean = boolean> =
    NarrowEvent<SchemaInfer<typeof EventDetailsSchema>, IsBillable>;

export type EventSummary = SchemaInfer<typeof EventSummarySchema>;

//
// - Secondary Types
//

export type EventMaterial<IsBillable extends boolean = boolean> =
    IsBillable extends true
        ? SchemaInfer<typeof EventMaterialBillableSchema>
        : SchemaInfer<typeof EventMaterialNotBillableSchema>;

export type EventMaterialWithQuantityMissing = SchemaInfer<typeof EventMaterialWithQuantityMissingSchema>;

export type EventExtra = SchemaInfer<typeof EventExtraSchema>;

export type EventTechnician = SchemaInfer<typeof EventTechnicianSchema>;

export type EventTax = SchemaInfer<typeof EventTaxSchema>;
export type EventTaxTotal = SchemaInfer<typeof EventTaxTotalSchema>;

//
// - Edition
//

// FIXME: À compléter.
export type EventEdit = {
    title: string,
    operation_period: Period | null,
    mobilization_period: Period | null,
    location: string | null,
    description: string | null,
    color: string | null,
    is_billable: boolean,
    is_confirmed: boolean,
    beneficiaries?: Array<Beneficiary['id']>,
    note?: string | null,
};

type EventDuplicatePayload = {
    operation_period: Period | null,
    mobilization_period: Period | null,
    keepBillingData?: boolean,
};

type EventReturnInventoryMaterial = {
    id: Material['id'],
    actual: number,
    broken: number,
};
type EventReturnInventory = EventReturnInventoryMaterial[];

type EventDepartureInventoryMaterial = {
    id: Material['id'],
    actual: number,
    comment?: string | null,
};
type EventDepartureInventory = EventDepartureInventoryMaterial[];

export type EventTechnicianEdit = {
    period: Period | null,
    position: string | null,
};

//
// - Récupération
//

type GetAllParams = {
    search?: string,
    exclude?: number | undefined,
    onlySelectable?: boolean,
};

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

const all = async (params: GetAllParams = {}): Promise<CountedData<EventSummary[]>> => {
    const response = await requester.get('/events', { params });
    return withCountedEnvelope(EventSummarySchema).parse(response.data);
};

const one = async (id: Event['id']): Promise<EventDetails> => {
    const response = await requester.get(`/events/${id}`);
    return EventDetailsSchema.parse(response.data);
};

const missingMaterials = async (id: Event['id']): Promise<EventMaterialWithQuantityMissing[]> => {
    const response = await requester.get(`/events/${id}/missing-materials`);
    return EventMaterialWithQuantityMissingSchema.array().parse(response.data);
};

const setConfirmed = async (id: Event['id'], isConfirmed: boolean): Promise<EventDetails> => {
    const response = await requester.put(`/events/${id}`, { is_confirmed: isConfirmed });
    return EventDetailsSchema.parse(response.data);
};

const archive = async (id: Event['id']): Promise<EventDetails> => {
    const response = await requester.put(`/events/${id}/archive`);
    return EventDetailsSchema.parse(response.data);
};

const unarchive = async (id: Event['id']): Promise<EventDetails> => {
    const response = await requester.put(`/events/${id}/unarchive`);
    return EventDetailsSchema.parse(response.data);
};

const updateDepartureInventory = async (id: Event['id'], inventory: EventDepartureInventory): Promise<EventDetails> => {
    const response = await requester.put(`/events/${id}/departure`, inventory);
    return EventDetailsSchema.parse(response.data);
};

const finishDepartureInventory = async (id: Event['id'], inventory: EventDepartureInventory): Promise<EventDetails> => {
    const response = await requester.put(`/events/${id}/departure/finish`, inventory);
    return EventDetailsSchema.parse(response.data);
};

const cancelDepartureInventory = async (id: Event['id']): Promise<EventDetails> => {
    const response = await requester.delete(`/events/${id}/departure`);
    return EventDetailsSchema.parse(response.data);
};

const updateReturnInventory = async (id: Event['id'], inventory: EventReturnInventory): Promise<EventDetails> => {
    const response = await requester.put(`/events/${id}/return`, inventory);
    return EventDetailsSchema.parse(response.data);
};

const finishReturnInventory = async (id: Event['id'], inventory: EventReturnInventory): Promise<EventDetails> => {
    const response = await requester.put(`/events/${id}/return/finish`, inventory);
    return EventDetailsSchema.parse(response.data);
};

const cancelReturnInventory = async (id: Event['id']): Promise<EventDetails> => {
    const response = await requester.delete(`/events/${id}/return`);
    return EventDetailsSchema.parse(response.data);
};

const createInvoice = async (id: Event['id']): Promise<Invoice> => {
    const response = await requester.post(`/events/${id}/invoices`);
    return InvoiceSchema.parse(response.data);
};

const createEstimate = async (id: Event['id']): Promise<Estimate> => {
    const response = await requester.post(`/events/${id}/estimates`);
    return EstimateSchema.parse(response.data);
};

const create = async (data: EventEdit): Promise<EventDetails> => {
    const response = await requester.post(`/events`, data);
    return EventDetailsSchema.parse(response.data);
};

const update = async (id: Event['id'], data: Partial<EventEdit>): Promise<EventDetails> => {
    const response = await requester.put(`/events/${id}`, data);
    return EventDetailsSchema.parse(response.data);
};

const getTechnicianAssignment = async (eventTechnicianId: EventTechnician['id']): Promise<EventTechnician> => {
    const response = await requester.get(`/event-technicians/${eventTechnicianId}`);
    return EventTechnicianSchema.parse(response.data);
};

const addTechnicianAssignment = async (
    id: Event['id'],
    technicianId: Technician['id'],
    data: EventTechnicianEdit,
): Promise<EventTechnician> => {
    const payload = { ...data, event_id: id, technician_id: technicianId };
    const response = await requester.post(`/event-technicians`, payload);
    return EventTechnicianSchema.parse(response.data);
};

const updateTechnicianAssignment = async (
    eventTechnicianId: EventTechnician['id'],
    data: Partial<EventTechnicianEdit>,
): Promise<EventTechnician> => {
    const response = await requester.put(`/event-technicians/${eventTechnicianId}`, data);
    return EventTechnicianSchema.parse(response.data);
};

const deleteTechnicianAssignment = async (eventTechnicianId: EventTechnician['id']): Promise<void> => {
    await requester.delete(`/event-technicians/${eventTechnicianId}`);
};

const duplicate = async (id: Event['id'], data: EventDuplicatePayload): Promise<EventDetails> => {
    const response = await requester.post(`/events/${id}/duplicate`, data);
    return EventDetailsSchema.parse(response.data);
};

const remove = async (id: Event['id']): Promise<void> => {
    await requester.delete(`/events/${id}`);
};

const documents = async (id: Event['id']): Promise<Document[]> => {
    const response = await requester.get(`/events/${id}/documents`);
    return DocumentSchema.array().parse(response.data);
};

const attachDocument = async (id: Event['id'], file: File, options: RequestConfig = {}): Promise<Document> => {
    const formData = new FormData(); formData.append('file', file);
    const response = await requester.post(`/events/${id}/documents`, formData, options);
    return DocumentSchema.parse(response.data);
};

export default {
    all,
    one,
    missingMaterials,
    setConfirmed,
    archive,
    unarchive,
    updateDepartureInventory,
    finishDepartureInventory,
    cancelDepartureInventory,
    updateReturnInventory,
    finishReturnInventory,
    cancelReturnInventory,
    createInvoice,
    createEstimate,
    duplicate,
    create,
    update,
    getTechnicianAssignment,
    addTechnicianAssignment,
    updateTechnicianAssignment,
    deleteTechnicianAssignment,
    remove,
    documents,
    attachDocument,
};
