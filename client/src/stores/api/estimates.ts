import { z } from '@/utils/validation';
import requester from '@/globals/requester';

import type { SchemaInfer } from '@/utils/validation';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

const EstimateTaxSchema = z.strictObject({
    name: z.string(),
    is_rate: z.boolean(),
    value: z.decimal(),
    total: z.decimal(),
});

export const EstimateSchema = z.strictObject({
    id: z.number(),
    date: z.datetime(),
    url: z.string(),
    total_without_taxes: z.decimal(),
    total_taxes: z.lazy(() => EstimateTaxSchema.array()),
    total_with_taxes: z.decimal(),
    currency: z.currency(),
});

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type Estimate = SchemaInfer<typeof EstimateSchema>;

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

const remove = async (id: Estimate['id']): Promise<void> => {
    await requester.delete(`/estimates/${id}`);
};

export default { remove };
