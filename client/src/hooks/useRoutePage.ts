import { computed } from '@vue/composition-api';
import useRouter from '@/hooks/useRouter';

import type { Ref } from '@vue/composition-api';

const useRoutePage = (): Ref<number> => {
    const { route } = useRouter();

    const page = computed<number>(() => {
        const { query } = route.value;
        if (!query || !query.page) {
            return 1;
        }
        return Number.parseInt(query.page as string, 10);
    });

    return page;
};

export default useRoutePage;
