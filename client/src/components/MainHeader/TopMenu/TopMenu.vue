<template>
  <div v-click-outside="closeDropdown" class="TopMenu">
    <div class="TopMenu__dropdown-btn" @click="toggleDropdown">
      <span class="TopMenu__welcome">{{ $t('hello-nick', {nick: nickname}) }}</span>
      <i v-show="!isDropdownMenuOpen" class="fas fa-chevron-down" />
      <i v-show="isDropdownMenuOpen" class="fas fa-chevron-up" />
    </div>
    <ul
      class="TopMenu__dropdown"
      :class="{ 'TopMenu__dropdown--open': isDropdownMenuOpen }"
    >
      <div class="TopMenu__dropdown__nickname">{{ nickname }}</div>
      <router-link to="/profile" custom v-slot="{ navigate, isActive }">
        <li
          @click="navigate"
          class="TopMenu__dropdown__item"
          :class="{ 'TopMenu__dropdown__item--active': isActive }"
        >
          <i class="fas fa-user-alt" />
          {{$t('your-profile')}}
        </li>
      </router-link>
      <router-link to="/user-settings" custom v-slot="{ navigate, isActive }">
        <li
          @click="navigate"
          class="TopMenu__dropdown__item"
          :class="{ 'TopMenu__dropdown__item--active': isActive }"
        >
          <i class="fas fa-cogs" />
          {{$t('your-settings')}}
        </li>
      </router-link>
      <div
        class="TopMenu__dropdown__item"
        @click="logout"
      >
        <i class="fas fa-power-off" /> {{$t('logout-quit')}}
      </div>
    </ul>
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './TopMenu';
</style>

<script>
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
};
</script>
