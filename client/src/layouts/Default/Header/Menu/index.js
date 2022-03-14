import './index.scss';
import Dropdown, { getItemClassnames } from '@/components/Dropdown';

// @vue/component
export default {
    name: 'DefaultLayoutHeaderMenu',
    computed: {
        pseudo() {
            return this.$store.state.auth.user.pseudo;
        },
    },
    methods: {
        logout() {
            this.$store.dispatch('auth/logout').then(() => {
                this.$router.replace({ path: '/login', hash: 'bye' });
            });
        },
    },
    render() {
        const { $t: __, pseudo, logout } = this;

        return (
            <nav class="DefaultLayoutHeaderMenu">
                <Dropdown>
                    <template slot="buttonText">{__('hello-pseudo', { pseudo })}</template>
                    <template slot="items">
                        <router-link to="/user-settings" custom>
                            {({ navigate, isActive }) => (
                                <li onClick={navigate} class={getItemClassnames(isActive)}>
                                    <i class="fas fa-cogs" /> {__('your-settings')}
                                </li>
                            )}
                        </router-link>
                        <li class="Dropdown__item" onClick={logout}>
                            <i class="fas fa-power-off" /> {__('logout-quit')}
                        </li>
                    </template>
                </Dropdown>
            </nav>
        );
    },
};
