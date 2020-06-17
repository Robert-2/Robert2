<template id="SideNav-template">
  <div class="SideNav" :class="{'SideNav--opened': isOpen}">
    <div class="SideNav__logo">
      <img src="/img/logos/R-only.svg">
    </div>
    <SideMenu class="SideNav__menu" />
    <div class="SideNav__footer">
      © 2017-{{ year }}<br>
      v. {{ version }}, API v. {{ apiVersion }}
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './SideNav';
</style>

<script>
import version from '@/VERSION';
import Config from '@/config/globalConfig';
import SideMenu from './SideMenu/SideMenu.vue';

export default {
  name: 'SideNav',
  props: { isOpen: Boolean },
  components: { SideMenu },
  data() {
    const year = (new Date()).getFullYear();
    const apiVersion = Config.api.version;
    return { year, version, apiVersion };
  },
};
</script>
