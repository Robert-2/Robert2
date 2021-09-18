import './index.scss';
import { ref, computed, watch } from '@vue/composition-api';
import queryClient from '@/globals/queryClient';
import useRouter from '@/hooks/useRouter';
import { useQueryProvider } from 'vue-query';
import Header from '@/components/MainHeader';
import Sidebar from '@/components/Sidebar';

// @vue/component
const App = (props, { root }) => {
    const isOpenedSidebar = ref(false);
    const isLogged = computed(() => root.$store.getters['auth/isLogged']);
    const { route } = useRouter();
    useQueryProvider(queryClient);

    // - Configure Axios pour qu'il redirige en cas de soucis de connexion lors des requêtes API.
    root.$http.interceptors.response.use((response) => response, (error) => {
        const { status } = error.response || { status: 0 };
        if (status === 401) {
            root.$store.dispatch('auth/logout').then(() => {
                root.$router.replace({ path: '/login', hash: 'expired' })
                    .catch(() => {});
            });
        }
        return Promise.reject(error);
    });

    // - "Cache" les modales ouvertes entre deux changements de page.
    watch(route, () => { root.$modal.hideAll(); });

    const handleToggleSidebar = (isOpen) => {
        if (isOpen === 'toggle') {
            isOpenedSidebar.value = !isOpenedSidebar.value;
            return;
        }
        isOpenedSidebar.value = isOpen;
    };

    return () => (
        <div class="App">
            {isLogged.value && <Header onToggleMenu={handleToggleSidebar} />}
            <div class="App__body">
                {isLogged.value && <Sidebar isOpen={isOpenedSidebar.value} />}
                <router-view key={route.value.path} />
            </div>
        </div>
    );
};

export default App;
