<template>
  <div v-click-outside="closeDropdown" class="TopMenu">
    <div class="TopMenu__dropdown-btn" @click="toggleDropdown">
      <span class="TopMenu__welcome">{{ $t('hello-nick', {nick: nickname}) }}</span>
      <i v-show="!isDropdownMenuOpen" class="fas fa-chevron-down" />
      <i v-show="isDropdownMenuOpen" class="fas fa-chevron-up" />
    </div>
    <div
      class="TopMenu__dropdown"
      :class="{ 'TopMenu__dropdown--open': isDropdownMenuOpen }"
    >
      <div class="TopMenu__dropdown__nickname">{{ nickname }}</div>
      <router-link
        to="/profile"
        tag="div"
        class="TopMenu__dropdown__item"
      >
        <i class="fas fa-user-alt" />
        {{$t('your-profile')}}
      </router-link>
      <router-link
        to="/settings"
        tag="div"
        class="TopMenu__dropdown__item"
      >
        <i class="fas fa-cogs" />
        {{$t('your-settings')}}
      </router-link>
      <div
        class="TopMenu__dropdown__item"
        @click="logout"
      >
        <i class="fas fa-power-off" />
          {{$t('logout-quit')}}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './TopMenu';
</style>

<script>
import ClickOutside from 'vue-click-outside';
import Auth from '@/auth';
import store from '@/store';

export default {
  name: 'TopMenu',
  directives: { ClickOutside },
  data() {
    return { isDropdownMenuOpen: false };
  },
  computed: {
    nickname() { return store.state.user.pseudo; },
    isAdmin() { return store.state.user.groupId === 'admin'; },
    isMember() { return store.state.user.groupId === 'member'; },
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
      Auth.logout({ mode: 'bye' });
    },
  },
};
</script>
