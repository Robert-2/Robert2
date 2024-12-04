import { z } from '@/utils/validation';

import type { SchemaInfer } from '@/utils/validation';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

const InvoiceTaxSchema = z.strictObject({
    name: z.string(),
    is_rate: z.boolean(),
    value: z.decimal(),
    total: z.decimal(),
});

export const InvoiceSchema = z.strictObject({
    id: z.number(),
    number: z.string(),
    date: z.datetime(),
    url: z.string(),
    total_without_taxes: z.decimal(),
    total_taxes: z.lazy(() => InvoiceTaxSchema.array()),
    total_with_taxes: z.decimal(),
    currency: z.currency(),
});

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type Invoice = SchemaInfer<typeof InvoiceSchema>;
