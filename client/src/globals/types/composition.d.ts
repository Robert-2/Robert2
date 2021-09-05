import type { SetupContext } from '@vue/composition-api';

module '@vue/composition-api' {
    export type Render = () => VNode | null;

    export interface Component<Props> {
        // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
        (props: Props, ctx: SetupContext): Record<string, unknown> | Render | void;
        props: ComponentPropsOptions<Props>;
    }
}
