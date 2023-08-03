declare module 'vue' {
    import type { VueConstructor as VueConstructorCore } from 'vue';

    export type { VNode } from 'vue';

    export type ComponentRef<T extends abstract new (...args: any) => any> = (
        | InstanceType<T>
        | undefined
    );

    export interface VueConstructor extends VueConstructorCore {
        $router: any;
        $route: any;
    }
}

declare module 'vue/types/options' {
    import type {
        CreateElement,
        RenderContext,
        VNode,
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
