/* eslint-disable import/prefer-default-export */

import Color from '@/utils/color';
import DateTime from '@/utils/datetime';
import Day from '@/utils/day';
import stringIncludes from '@/utils/stringIncludes';
import get from 'lodash/get';

import type { ColumnSearcher } from 'vue-tables-2-premium';

// @see https://github.com/matfish2/vue-tables-2-private/blob/master/lib/methods/client-search.js
export const defaultSearcher = (key: string): ColumnSearcher => {
    const isMatching = (value: unknown, query: string): boolean => {
        if (value === undefined || value === null || typeof query !== 'string') {
            return false;
        }

        if (['string', 'number', 'boolean'].includes(typeof value)) {
            const normalizedValue = String(value).toLowerCase();
            return stringIncludes(normalizedValue, query);
        }

        if (value instanceof Color) {
            const normalizedValue = value.toHexString();
            return stringIncludes(normalizedValue, query);
        }

        if (value instanceof Day || value instanceof DateTime || value instanceof Date) {
            return false;
        }

        if (typeof value === 'object') {
            return Object.values(value).some(
                (subValue: unknown) => isMatching(subValue, query),
            );
        }

        // - Affiche un message, en développement uniquement, quand on arrive pas à traiter
        //   explicitement la valeur de la colonne via les conditions ci-dessus.
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn(`Unhandled search value type \`${typeof value}\``, value);
        }

        return false;
    };

    return (row: unknown, query: string): boolean => {
        if (typeof row !== 'object' || row === null) {
            return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        const value: unknown = get(row, key, undefined);
        return isMatching(value, query);
    };
};
