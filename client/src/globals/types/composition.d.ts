import type { SetupContext } from '@vue/composition-api';

declare global {
    interface FC<Props> {
        // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
        (props: Props, ctx: SetupContext): Record<string, unknown> | (() => VNode | null) | void;
        props: ComponentPropsOptions<Props>;
    }
}
