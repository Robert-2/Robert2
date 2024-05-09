import { z } from '@/utils/validation';
import requester from '@/globals/requester';

import type { SchemaInfer } from '@/utils/validation';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

export const EstimateSchema = z.strictObject({
    id: z.number(),
    date: z.datetime(),
    url: z.string(),
    discount_rate: z.decimal(),
    total_without_taxes: z.decimal(),
    total_with_taxes: z.decimal(),
    currency: z.string(),
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
