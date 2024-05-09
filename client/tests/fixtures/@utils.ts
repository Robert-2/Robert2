import collect from 'collect.js';
import { cloneDeep } from 'lodash';

import type { Collection } from 'collect.js';
import type { CountedData, PaginatedData } from '@/stores/api/@types';

type FactoryDataShape = { id: number | string };
export type FactoryCallback<
    T extends FactoryDataShape = any,
    R extends Record<string, any> = Record<string, any>,
> = (item: T) => R;

export type FactoryReturnType<
    T extends FactoryDataShape = any,
    R extends Record<string, any> = T,
> = (
    & ((id: T['id']) => R)
    & (() => R[])
);

export function dataFactory<T extends FactoryDataShape = any>(data: T[]): FactoryReturnType<T>;
export function dataFactory<
    T extends FactoryDataShape = any,
    R extends Record<string, any> = Record<string, any>,
>(
    data: T[],
    callback: FactoryCallback<T, R>,
): FactoryReturnType<T, R>;
export function dataFactory<
    T extends FactoryDataShape = any,
    R extends Record<string, any> = Record<string, any>,
>(
    data: T[],
    callback?: FactoryCallback<T, R>,
): FactoryReturnType<T, R> {
    const collection = collect(cloneDeep(data)).keyBy('id');

    return (id?: T['id']) => {
        let _collection: Collection<any> = collection;

        if (callback) {
            _collection = _collection.map(
                (item: T): unknown => callback(cloneDeep(item)),
            );
        }

        return _collection.pipe((items: Collection<any>) => (
            id ? items.get(id) : items.values().all()
        ));
    };
}

export const withPaginationEnvelope = <T>(data: T[]): PaginatedData<T[]> => ({
    data,
    pagination: {
        perPage: data.length,
        currentPage: 1,
        total: {
            items: data.length,
            pages: 1,
        },
    },
});

export const withCountedEnvelope = <T>(data: T[]): CountedData<T[]> => ({
    data,
    count: data.length,
});
