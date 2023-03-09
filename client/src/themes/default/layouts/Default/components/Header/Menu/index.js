import './index.scss';
import { mapState, mapActions } from 'vuex';
import Dropdown from '@/themes/default/components/Dropdown';
import Fragment from '@/components/Fragment';
import Button from '@/themes/default/components/Button';

// @vue/component
export default {
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
                    scopedSlots={{
                        buttonText: () => __('hello-name', { name }),
                        items: () => (
                            <Fragment>
                                <Button
                                    to={{ name: 'user-settings' }}
                                    icon="cogs"
                                    class="DefaultLayoutHeaderMenu__dropdown-item"
                                >
                                    {__('your-settings')}
                                </Button>
                                <Button
                                    icon="power-off"
                                    onClick={handleLogout}
                                    class="DefaultLayoutHeaderMenu__dropdown-item"
                                >
                                    {__('logout-quit')}
                                </Button>
                            </Fragment>
                        ),
                    }}
                />
            </nav>
        );
    },
};
