import type { VNode } from 'vue';
import type { ComponentRenderProxy } from '@vue/composition-api';

declare global {
    namespace JSX {
        interface Element extends VNode {}
        interface ElementClass extends ComponentRenderProxy {}
        interface ElementAttributesProperty {
            $props: any;
            $store: any;
            $router: any;
            $route: any;
        }

        type Node = Element | Element[] | string | number | null;

        // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
        interface IntrinsicElements {
            [elem: string]: any;
        }
    }
}
