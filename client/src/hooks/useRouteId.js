import { computed } from '@vue/composition-api';
import useRouter from '@/hooks/useRouter';

const useRouteId = () => {
    const { route } = useRouter();

    return computed(() => (
        route.value.params.id && route.value.params.id !== 'new'
            ? route.value.params.id
            : null
    ));
};

export default useRouteId;
