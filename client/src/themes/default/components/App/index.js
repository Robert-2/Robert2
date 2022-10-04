import invariant from 'invariant';
import { useQueryProvider } from 'vue-query';
import { computed, watch } from '@vue/composition-api';
import queryClient from '@/globals/queryClient';
import useRouter from '@/hooks/vue/useRouter';
import layouts from '@/themes/default/layouts';

// @vue/component
const App = (props, { root }) => {
    useQueryProvider(queryClient);
    const { route } = useRouter();
    const layout = computed(() => {
        const routeMeta = route.value?.meta;
        return routeMeta?.layout ?? 'default';
    });

    // - Configure Axios pour qu'il redirige en cas de soucis de connexion lors des requêtes API.
    root.$http.interceptors.response.use((response) => response, (error) => {
        const { status } = error.response || { status: 0 };
        if (status === 401) {
            root.$store.dispatch('auth/logout').then(() => {
                root.$router.replace({ path: '/login', hash: '#expired' })
                    .catch(() => {});
            });
        }
        return Promise.reject(error);
    });

    // - "Cache" les modales ouvertes entre deux changements de page.
    watch(route, () => { root.$modal.hideAll(); });

    return () => {
        invariant(layout.value in layouts, `Le layout "${layout}" n'existe pas.`);
        const Layout = layouts[layout.value];

        return (
            <Layout>
                <router-view key={route.value.path} />
            </Layout>
        );
    };
};

export default App;
