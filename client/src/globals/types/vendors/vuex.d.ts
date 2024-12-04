/* eslint-disable import/extensions */

declare module 'vuex' {
    import type { Module } from 'vuex';

    export * from 'vuex/types/index.d.ts';

    export type ModuleState<T extends Module<any, any>, S = Required<T>['state']> = (
        S extends (() => infer R) ? R : S
    );

    export type ModulesStates<T extends Record<string, Module<any, any>>> = {
        [K in keyof T]: ModuleState<T[K]>
    };
}
