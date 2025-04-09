import safeJsonParse from '@/utils/safeJsonParse';

import type { AnyZodObject } from 'zod';
import type { SchemaInfer } from './validation';

export const getPersistedFilters = <T extends AnyZodObject>(key: string, schema: T): Partial<SchemaInfer<T>> | null => {
    const savedFiltersRaw = localStorage.getItem(key);
    if (savedFiltersRaw === null) {
        return null;
    }

    const looseSchema = schema.strip().partial();
    const result = looseSchema.safeParse(safeJsonParse(savedFiltersRaw));
    return !result.success ? {} : (
        Object.fromEntries(
            Object.entries(result.data).filter(
                ([, v]: [string, unknown]) => v !== undefined,
            ),
        )
    ) as Partial<SchemaInfer<T>>;
};

export const persistFilters = <T extends Record<string, any>>(key: string, filters: T): void => {
    localStorage.setItem(key, JSON.stringify(filters));
};

export const clearPersistedFilters = (key: string): void => {
    localStorage.removeItem(key);
};
