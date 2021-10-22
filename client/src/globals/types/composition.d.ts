import type { VNode } from 'vue';
import type {
    ComponentPropsOptions,
    EmitsOptions,
    SetupContext,
} from '@vue/composition-api';

module '@vue/composition-api' {
    export type Render = () => VNode | null;

    export type ImplicitProps = {
        key?: string | number,
    };

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    type ComponentReturnType = Record<string, unknown> | Render | void;

    export interface Component<Props, ReturnType extends ComponentReturnType = Render> {
        (props: Props & ImplicitProps, ctx: SetupContext): ReturnType;
        props?: ComponentPropsOptions<Omit<Props, `on${string}`>>;
        emits?: EmitsOptions;
    }
}
