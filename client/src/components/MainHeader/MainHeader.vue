<template>
  <div class="MainHeader">
    <div class="MainHeader__logo">
      <Logo minimalist />
    </div>
    <div class="MainHeader__menu-toggle" @click="toggleMenu">
      <i class="fas fa-bars fa-2x"></i>
    </div>
    <div class="MainHeader__title">
      {{ $t(pageTitle, { pageSubTitle }) }}
    </div>
    <TopMenu class="MainHeader__menu" />
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './MainHeader';
</style>

<script>
import store from '@/store';
import Logo from '@/components/Logo/Logo.vue';
import TopMenu from './TopMenu/TopMenu.vue';

export default {
  name: 'MainHeader',
  components: { TopMenu, Logo },
  computed: {
    pageTitle() {
      return store.state.pageTitle;
    },
    pageSubTitle() {
      return store.state.pageSubTitle;
    },
  },
  watch: {
    pageTitle() {
      this.$emit('toggleMenu', false);
    },
  },
  methods: {
    toggleMenu() {
      this.$emit('toggleMenu', 'toggle');
    },
  },
};
</script>
