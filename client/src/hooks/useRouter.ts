import { ref, watch } from '@vue/composition-api';
import getRuntimeVm from '@/utils/getRuntimeVm';

import type { Ref } from '@vue/composition-api';
import type { Route } from 'vue-router';

type ReturnType = {
    route: Ref<Route>,
    router: any,
};

const useRouter = (): ReturnType => {
    const vm = getRuntimeVm();
    const route = ref<Route>(vm.$route);

    watch(() => vm.$route, (newRoute: Route) => {
        route.value = newRoute;
    });

    return { route, router: vm.$router };
};

export default useRouter;
