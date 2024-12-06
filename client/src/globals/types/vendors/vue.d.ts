import 'vue';

declare module 'vue' {
    import type { ComponentOptions, VueConstructor } from 'vue';
    import type { DefaultData, DefaultComputed, DefaultMethods } from 'vue/types/options';

    export type ComponentRef<T extends abstract new (...args: any) => any> = (
        | InstanceType<T>
        | undefined
    );

    export type RawComponent<Props = Record<string, any>, Methods = DefaultMethods<Vue>> = (
        & ComponentOptions<Vue, DefaultData<Vue>, Methods, DefaultComputed, Props>
        & VueConstructor
    );

    export type VNodeClass =
        | string
        | number
        | null
        | undefined
        | boolean
        | Record<string, boolean>
        | VNodeClass[];
}

declare module 'vue/types/options' {
    import type {
        VNode,
        CreateElement,
        RenderContext,
        ComponentOptions as CoreComponentOptions,
    } from 'vue';

    /* eslint-disable @typescript-eslint/no-unused-vars */
    interface ComponentOptions<
        V extends Vue,
        Data = DefaultData<V>,
        Methods = DefaultMethods<V>,
        Computed = DefaultComputed,
        PropsDef = PropsDefinition<DefaultProps>,
        Props = DefaultProps,
    > extends Omit<CoreComponentOptions, 'render'> {
        render?(createElement: CreateElement, hack: RenderContext<Props>): VNode | null;
    }
    /* eslint-enable @typescript-eslint/no-unused-vars */
}

declare module '*.vue' {
    import Vue from 'vue';

    export default Vue;
}
