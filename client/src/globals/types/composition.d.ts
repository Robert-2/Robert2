import type { VNode } from 'vue';

module '@vue/composition-api' {
    export type Render = () => VNode | null;

    export type ImplicitProps = {
        key?: string | number,
    };
}
