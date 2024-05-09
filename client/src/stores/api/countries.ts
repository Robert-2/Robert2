import { z } from '@/utils/validation';
import requester from '@/globals/requester';

import type { SchemaInfer } from '@/utils/validation';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

export const CountrySchema = z.strictObject({
    id: z.number(),
    name: z.string(),
    code: z.string(),
});

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type Country = SchemaInfer<typeof CountrySchema>;

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

const all = async (): Promise<Country[]> => {
    const response = await requester.get('/countries');
    return CountrySchema.array().parse(response.data);
};

export default { all };
