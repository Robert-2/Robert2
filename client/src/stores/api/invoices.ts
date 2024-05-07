import { z } from '@/utils/validation';

import type { SchemaInfer } from '@/utils/validation';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

export const InvoiceSchema = z.strictObject({
    id: z.number(),
    number: z.string(),
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

export type Invoice = SchemaInfer<typeof InvoiceSchema>;
