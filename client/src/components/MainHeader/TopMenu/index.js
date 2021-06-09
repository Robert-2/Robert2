import './index.scss';
import ClickOutside from 'vue-click-outside';

export default {
  name: 'TopMenu',
  directives: { ClickOutside },
  data() {
    return { isDropdownMenuOpen: false };
  },
  computed: {
    nickname() {
      return this.$store.state.auth.user.pseudo;
    },
  },
  watch: {
    $route() {
      this.closeDropdown();
    },
  },
  methods: {
    toggleDropdown() {
      this.isDropdownMenuOpen = !this.isDropdownMenuOpen;
    },

    closeDropdown() {
      this.isDropdownMenuOpen = false;
    },

    logout() {
      this.$store.dispatch('auth/logout').then(() => {
        this.$router.replace({ path: '/login', hash: 'bye' });
      });
    },
  },
  render() {
    const {
      $t: __,
      nickname,
      isDropdownMenuOpen,
      toggleDropdown,
      closeDropdown,
      logout,
    } = this;

    const getDropDownItemClassnames = (isActive) => ({
      TopMenu__dropdown__item: true,
      'TopMenu__dropdown__item--active': isActive,
    });

    return (
      <div class="TopMenu" vClickOutside={closeDropdown}>
        <div class="TopMenu__dropdown-btn" onClick={toggleDropdown}>
          <span class="TopMenu__welcome">
            {__('hello-nick', { nick: nickname })}
          </span>
          {isDropdownMenuOpen ? <i class="fas fa-chevron-up" /> : <i class="fas fa-chevron-down" />}
        </div>
        <ul class={{ TopMenu__dropdown: true, 'TopMenu__dropdown--open': isDropdownMenuOpen }}>
          <div class="TopMenu__dropdown__nickname">
            {nickname}
          </div>
          <router-link to="/profile" custom>
            {({ navigate, isActive }) => (
              <li onClick={navigate} class={getDropDownItemClassnames(isActive)}>
                <i class="fas fa-user-alt" />{' '}
                {__('your-profile')}
              </li>
            )}
          </router-link>
          <router-link to="/user-settings" custom>
            {({ navigate, isActive }) => (
              <li onClick={navigate} class={getDropDownItemClassnames(isActive)}>
                <i class="fas fa-cogs" />{' '}
                {__('your-settings')}
              </li>
            )}
          </router-link>
          <div class="TopMenu__dropdown__item" onClick={logout}>
            <i class="fas fa-power-off" />{' '}
            {__('logout-quit')}
          </div>
        </ul>
      </div>
    );
  },
};
