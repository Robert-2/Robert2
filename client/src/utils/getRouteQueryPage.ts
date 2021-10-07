import type { Ref } from '@vue/composition-api';
import type { RouteData } from '@/hooks/useRouter';

const getRouteQueryPage = (route: Ref<RouteData>): number => {
    const { query } = route.value;
    if (!query || !query.page) {
        return 1;
    }

    return Number.parseInt(query.page, 10);
};

export default getRouteQueryPage;
