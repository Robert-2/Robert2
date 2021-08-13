import './index.scss';
import Dropdown, { getItemClassnames } from '@/components/Dropdown';

export default {
    name: 'TopMenu',
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
      <div class="TopMenu">
        <Dropdown>
          <template slot="buttonText">{__('hello-pseudo', { pseudo })}</template>
          <template slot="items">
            <router-link to="/profile" custom>
              {({ navigate, isActive }) => (
                <li onClick={navigate} class={getItemClassnames(isActive)}>
                  <i class="fas fa-user-alt" />{' '}
                  {__('your-profile')}
                </li>
              )}
            </router-link>
            <router-link to="/user-settings" custom>
              {({ navigate, isActive }) => (
                <li onClick={navigate} class={getItemClassnames(isActive)}>
                  <i class="fas fa-cogs" />{' '}
                  {__('your-settings')}
                </li>
              )}
            </router-link>
            <li class="Dropdown__item" onClick={logout}>
              <i class="fas fa-power-off" />{' '}
              {__('logout-quit')}
            </li>
          </template>
        </Dropdown>
      </div>
        );
    },
};
