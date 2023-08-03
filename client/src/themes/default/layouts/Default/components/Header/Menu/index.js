import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { mapState, mapActions } from 'vuex';
import Dropdown from './Dropdown';

// @vue/component
const DefaultLayoutHeaderMenu = defineComponent({
    name: 'DefaultLayoutHeaderMenu',
    computed: {
        ...mapState('auth', ['user']),
    },
    methods: {
        ...mapActions('auth', ['logout']),

        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleLogout() {
            await this.logout();
            this.$router.replace({ path: '/login', hash: '#bye' });
        },
    },
    render() {
        const { $t: __, user, handleLogout } = this;
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
