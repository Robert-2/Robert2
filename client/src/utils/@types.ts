import type { UnionToIntersection } from 'type-fest';

// @see https://github.com/sindresorhus/type-fest/issues/819
// @see https://github.com/colinhacks/zod/blob/v3.22.4/src/helpers/enumUtil.ts
type GetUnionLast<T> = UnionToIntersection<() => T> extends () => infer Last ? Last : never;
type UnionToTuple<T, Tuple extends unknown[] = []> = (
    [T] extends [never]
        ? Tuple
        : UnionToTuple<Exclude<T, GetUnionLast<T>>, [GetUnionLast<T>, ...Tuple]>
);
type CastToStringTuple<T> = T extends [string, ...string[]] ? T : never;
export type UnionToTupleString<T> = CastToStringTuple<UnionToTuple<T>>;
