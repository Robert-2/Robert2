import './index.scss';
import Vue from 'vue';
import Header from '@/components/MainHeader';
import Sidebar from '@/components/Sidebar';

// @vue/component
export default {
    name: 'App',
    data() {
        return { isOpenedSidebar: false };
    },
    computed: {
        isLogged() {
            return this.$store.getters['auth/isLogged'];
        },
    },
    watch: {
        $route() {
            Vue.prototype.$modal.hideAll();
        },
    },
    created() {
        this.$http.interceptors.response.use((response) => response, (error) => {
            const { status } = error.response || { status: 0 };
            if (status === 401) {
                this.$store.dispatch('auth/logout').then(() => {
                    this.$router.replace({ path: '/login', hash: 'expired' })
                        .catch(() => {});
                });
            }
            return Promise.reject(error);
        });
    },
    methods: {
        handleToggleSidebar(isOpen) {
            if (isOpen === 'toggle') {
                this.isOpenedSidebar = !this.isOpenedSidebar;
                return;
            }
            this.isOpenedSidebar = isOpen;
        },
    },
    render() {
        const {
            $route,
            isLogged,
            isOpenedSidebar,
            handleToggleSidebar,
        } = this;

        return (
            <div id="app">
                <div class="main">
                    {isLogged && <Header onToggleMenu={handleToggleSidebar} />}
                    <div class="main__body">
                        {isLogged && <Sidebar isOpen={isOpenedSidebar} />}
                        <router-view key={$route.path} />
                    </div>
                </div>
            </div>
        );
    },
};
