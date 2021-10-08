import { ref, watch } from '@vue/composition-api';
import getRuntimeVm from '@/utils/getRuntimeVm';

import type { Ref } from '@vue/composition-api';

export type RouteData = {
    name: string,
    params: Record<string, string>,
    query: Record<string, string> | undefined,
    path: string,
    fullPath: string,
    hash: string,
    matched: Array<Record<string, unknown>>,
    meta: Record<string, boolean | number | string | string[]>,
};

type UseRouterReturnType = {
    route: Ref<RouteData>,
    router: any,
};

const useRouter = (): UseRouterReturnType => {
    const vm = getRuntimeVm();
    const route = ref<RouteData>(vm.$route);

    watch(() => vm.$route, (newRoute: RouteData) => {
        route.value = newRoute;
    });

    return { route, router: vm.$router };
};

export default useRouter;
