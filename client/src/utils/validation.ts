import core from 'zod';
import Decimal from 'decimal.js';
import Period, { SerializedPeriodSchema } from '@/utils/period';
import DateTime from '@/utils/datetime';
import Day from '@/utils/day';

import type { RefinementCtx } from 'zod';
import type { SerializedPeriod } from '@/utils/period';

/**
 * Prise en charge d'une période sérialisée.
 *
 * @returns Un wrapper de validation d'une période "brute" (= sérialisée).
 *          La période ne sera pas transformée, elle restera "brute".
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const serializedPeriod = () => SerializedPeriodSchema;

/**
 * Prise en charge d'une période, qu'elle soit sous forme d'instance ou sérialisée.
 *
 * @returns Un wrapper de validation de période (sérialisée ou non).
 *          Le retour sera en instance de `Period`.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const period = () => (
    core
        .union([serializedPeriod(), core.instanceof(Period)])
        .transform((value: Period | SerializedPeriod, ctx: RefinementCtx): Period => {
            try {
                return Period.from(value);
            } catch (error) {
                ctx.addIssue({
                    code: core.ZodIssueCode.custom,
                    params: {
                        code: 'invalid-period',
                        cause: error,
                    },
                });

                return core.NEVER;
            }
        })
);

/**
 * Prise en charge d'une date + heure, qu'elle soit sous forme d'instance ou sérialisée.
 *
 * @returns Un wrapper de validation de date + heure (sérialisée ou non).
 *          Le retour sera en instance de `DateTime`.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const datetime = () => (
    core
        .union([core.string(), core.instanceof(DateTime)])
        .transform((value: string | DateTime, ctx: RefinementCtx): DateTime => {
            try {
                return new DateTime(value);
            } catch (error) {
                ctx.addIssue({
                    code: core.ZodIssueCode.custom,
                    params: {
                        code: 'invalid-datetime',
                        cause: error,
                    },
                });

                return core.NEVER;
            }
        })
);

/**
 * Prise en charge d'une date sans heure (= une journée), qu'elle soit sous forme d'instance ou sérialisée.
 *
 * @returns Un wrapper de validation de date sans heure (sérialisée ou non).
 *          Le retour sera en instance de `Day`.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const day = () => (
    core
        .union([core.string(), core.instanceof(Day)])
        .transform((value: string | Day, ctx: RefinementCtx): Day => {
            try {
                return new Day(value);
            } catch (error) {
                ctx.addIssue({
                    code: core.ZodIssueCode.custom,
                    params: {
                        code: 'invalid-day',
                        cause: error,
                    },
                });

                return core.NEVER;
            }
        })
);

/**
 * Prise en charge d'une valeur décimale, qu'elle soit sous forme
 * d'instance, de nombre ou chaîne de caractère.
 *
 * @returns Un wrapper de validation de valeur décimale.
 *          (instance, nombre ou chaîne de caractère)
 *          Le retour sera en instance de `Decimal`.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const decimal = () => (
    core
        .union([
            core.string(),
            core.number(),
            core.instanceof(Decimal),
        ])
        .transform((value: string | number | Decimal, ctx: RefinementCtx): Decimal => {
            try {
                return new Decimal(value);
            } catch (error) {
                ctx.addIssue({
                    code: core.ZodIssueCode.custom,
                    params: {
                        code: 'invalid-decimal',
                        cause: error,
                    },
                });

                return core.NEVER;
            }
        })
);

export type {
    infer as SchemaInfer,
    output as SchemaOutput,
    input as SchemaInput,
    ZodType as SchemaType,
} from 'zod';

export const z = { ...core, decimal, period, datetime, day };
