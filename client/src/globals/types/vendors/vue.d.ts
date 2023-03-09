declare module 'vue' {
    import type { VueConstructor as VueConstructorCore } from 'vue';

    export interface VueConstructor extends VueConstructorCore {
        $store: any;
        $router: any;
        $route: any;
    }
}

declare module '*.vue' {
    import Vue from 'vue';

    export default Vue;
}
