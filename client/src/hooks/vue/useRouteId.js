import { computed } from '@vue/composition-api';
import useRouter from '@/hooks/vue/useRouter';

const useI18n = () => {
    const { route } = useRouter();

    return computed(() => (
        route.value.params.id && route.value.params.id !== 'new'
            ? route.value.params.id
            : null
    ));
};

export default useI18n;
