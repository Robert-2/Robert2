import { computed } from '@vue/composition-api';
import useRouter from '@/hooks/vue/useRouter';

const useRoutePage = () => {
    const { route } = useRouter();

    const page = computed(() => {
        const { query } = route.value;
        if (!query || !query.page) {
            return 1;
        }
        return Number.parseInt(query.page, 10);
    });

    return page;
};

export default useRoutePage;
