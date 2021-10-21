import type { VNode } from 'vue';
import type { ComponentPropsOptions, SetupContext } from '@vue/composition-api';

module '@vue/composition-api' {
    export type Render = () => VNode | null;

    export type ImplicitProps = {
        key?: string | number,
    };

    export interface Component<Props extends Record<string, unknown>> {
        (props: Props & ImplicitProps, ctx: SetupContext): Render;
        props?: ComponentPropsOptions<Props>;
        emits?: string[];
    }
}
