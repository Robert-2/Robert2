<template>
  <div id="app">
    <div class="main">
      <MainHeader v-if="user.groupId" @toggleMenu="toggleSideNav" />
      <div class="main__body">
        <SideNav v-if="user.groupId" :isOpen="isOpenedSideNav" />
        <router-view />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import './themes/default/index';
  @import './App';
</style>

<script>
import Vue from 'vue';
import store from '@/store';
import MainHeader from '@/components/MainHeader/MainHeader.vue';
import SideNav from '@/components/SideNav/SideNav.vue';

export default {
  name: 'App',
  components: { MainHeader, SideNav },
  data: () => ({
    user: store.state.user,
    isOpenedSideNav: false,
  }),
  watch: {
    $route() {
      Vue.prototype.$modal.hide('defaultModal');
    },
  },
  methods: {
    toggleSideNav(isOpen) {
      if (isOpen === 'toggle') {
        this.isOpenedSideNav = !this.isOpenedSideNav;
        return;
      }
      this.isOpenedSideNav = isOpen;
    },
  },
};
</script>
