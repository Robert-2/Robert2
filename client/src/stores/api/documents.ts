import { z } from '@/utils/validation';
import requester from '@/globals/requester';

import type { SchemaInfer } from '@/utils/validation';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

export const DocumentSchema = z.strictObject({
    id: z.number(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string(),
    created_at: z.datetime(),
});

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type Document = SchemaInfer<typeof DocumentSchema>;

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

const remove = async (id: Document['id']): Promise<void> => {
    await requester.delete(`/documents/${id}`);
};

export default { remove };
