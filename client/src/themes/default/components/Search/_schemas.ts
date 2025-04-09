import { z } from '@/utils/validation';

export const TokenValueSchema = z.union([
    z.string(),
    z.number(),
    z.array(z.union([z.string(), z.number()])),
]);

const CustomTokenSchema = z.strictObject({
    id: z.union([z.string(), z.number()]),
    type: z.string(),
    value: TokenValueSchema,
});

export const RawTokenSchema = z.union([
    CustomTokenSchema,
    CustomTokenSchema.omit({ id: true }),
    z.string(),
]);

const TokenOptionSchema = z.strictObject({
    icon: z.union([z.string(), z.undefined()]).optional(),
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    default: z.boolean().optional(),
    data: z.unknown().optional(),
});

export const TokenDefinitionSchema = z.object({
    type: z.string(),
    icon: z.string().optional(),
    title: z.string(),
    options: z.array(TokenOptionSchema),
    multiSelect: z.boolean().optional(),
    unique: z.boolean().optional(),
    disabled: z.boolean().optional(),
    render: z.function().optional(),
});
