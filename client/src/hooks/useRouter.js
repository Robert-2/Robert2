import { ref, watch } from '@vue/composition-api';
import getRuntimeVm from '@/utils/getRuntimeVm';

const useRouter = () => {
    const vm = getRuntimeVm();
    const route = ref(vm.$route);

    watch(() => vm.$route, (newRoute) => {
        route.value = newRoute;
    });

    return { route, router: vm.$router };
};

export default useRouter;
