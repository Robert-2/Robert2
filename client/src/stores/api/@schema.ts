import { z } from '@/utils/validation';

import type { UnionToTupleString } from '@/utils/@types';
import type { AnyZodObject, ZodEnum, ZodTypeAny } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const withPaginationEnvelope = <T extends ZodTypeAny>(dataSchema: T) => (
    z.object({
        data: dataSchema.array(),
        pagination: z.object({
            perPage: z.number().positive(),
            currentPage: z.number().nonnegative(),
            total: z.object({
                items: z.number().nonnegative(),
                pages: z.number().nonnegative(),
            }),
        }),
    })
);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const withCountedEnvelope = <T extends ZodTypeAny>(dataSchema: T) => (
    z.object({
        data: dataSchema.array(),
        count: z.number().nonnegative(),
    })
);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const withCsvImportResult = <T extends AnyZodObject>(mapping: T) => (
    z.strictObject({
        total: z.number().nonnegative(),
        success: z.number().nonnegative(),
        errors: z.array(z.strictObject({
            line: z.number().nonnegative(),
            message: z.string(),
            errors: z.array(z.strictObject({
                // - Requis pour patcher le `(T: AnyZodObject).keyof()` qui renvoi un `ZodEnum<never>` sinon.
                field: z.union([mapping.keyof() as any as ZodEnum<UnionToTupleString<keyof T['shape']>>, z.string()]),
                value: z.string().nullable(),
                error: z.string(),
            })),
        })),
    })
);
