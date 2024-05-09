import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Dropdown from './Dropdown';

// @vue/component
const DefaultLayoutHeaderMenu = defineComponent({
    name: 'DefaultLayoutHeaderMenu',
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleLogout() {
            await this.$store.dispatch('auth/logout');
            this.$router.replace({ name: 'login', hash: '#bye' });
        },
    },
    render() {
        const { $t: __, handleLogout } = this;
        const { user } = this.$store.state.auth;
        const { first_name: name } = user;

        return (
            <nav class="DefaultLayoutHeaderMenu">
                <Dropdown
                    label={__('hello-name', { name })}
                    actions={[
                        {
                            icon: 'cogs',
                            label: __('your-settings'),
                            to: { name: 'user-settings' },
                        },
                        {
                            icon: 'power-off',
                            label: __('logout-quit'),
                            onClick: handleLogout,
                        },
                    ]}
                />
            </nav>
        );
    },
});

export default DefaultLayoutHeaderMenu;
