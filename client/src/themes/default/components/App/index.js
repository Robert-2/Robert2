import invariant from 'invariant';
import HttpCode from 'status-code-enum';
import layouts from '@/themes/default/layouts';
import { isRequestErrorStatusCode } from '@/utils/errors';
import { defineComponent } from '@vue/composition-api';

// @vue/component
const App = defineComponent({
    name: 'App',
    computed: {
        layout() {
            const { meta } = this.$route;
            return meta?.layout ?? 'default';
        },
    },
    watch: {
        $route() {
            // - "Cache" les modales ouvertes entre deux changements de page.
            this.$modal.hideAll();
        },
    },
    created() {
        // - Configure Axios pour qu'il redirige en cas de soucis de connexion lors des requêtes API.
        this.$http.interceptors.response.use((response) => response, (error) => {
            if (isRequestErrorStatusCode(error, HttpCode.ClientErrorUnauthorized)) {
                this.$store.dispatch('auth/logout').then(() => {
                    this.$router.replace({ name: 'login', hash: '#expired' })
                        .catch(() => {});
                });
            }
            return Promise.reject(error);
        });
    },
    mounted() {
        this.showBootMessages();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        showBootMessages() {
            const showBootMessage = (type, message) => (
                this.$toasted[type](message, {
                    keepOnHover: true,
                    duration: 10_000,
                })
            );

            // - S'il y a des messages serveur, on les affiche.
            (window.__SERVER_MESSAGES__ ?? []).forEach(({ type, message }) => {
                if (!['success', 'info', 'error'].includes(type)) {
                    type = 'show';
                }
                showBootMessage(type, message);
            });
        },
    },
    render() {
        const { layout } = this;
        invariant(layout in layouts, `The \`${layout}\` layout doesn't exist.`);
        const Layout = layouts[layout];

        return (
            <Layout>
                <router-view key={this.$route.path} />
            </Layout>
        );
    },
});

export default App;
