<template id="SideNav-template">
    <div class="SideNav" :class="{ 'SideNav--opened': isOpen }">
        <div class="SideNav__logo">
            <Logo minimalist />
        </div>
        <SideMenu class="SideNav__menu" />
        <div class="SideNav__footer">
            © 2017-{{ year }}<br />
            v. {{ apiVersion }}
        </div>
    </div>
</template>

<style lang="scss">
    @import '../../themes/default/index';
    @import './SideNav';
</style>

<script>
import Config from '@/config/globalConfig';
import Logo from '@/components/Logo';
import SideMenu from './SideMenu/SideMenu.vue';

export default {
    name: 'SideNav',
    props: { isOpen: Boolean },
    components: { SideMenu, Logo },
    data() {
        const year = (new Date()).getFullYear();
        const apiVersion = Config.api.version;
        return { year, apiVersion };
    },
};
</script>
