<template>
    <div id="app">
        <div class="main">
            <MainHeader v-if="isLogged" @toggleMenu="toggleSideNav" />
            <div class="main__body">
                <SideNav v-if="isLogged" :isOpen="isOpenedSideNav" />
                <router-view :key="$route.path" />
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
import MainHeader from '@/components/MainHeader';
import SideNav from '@/components/SideNav/SideNav.vue';

export default {
    name: 'App',
    components: { MainHeader, SideNav },
    data() {
        return { isOpenedSideNav: false };
    },
    created() {
        this.$http.interceptors.response.use((response) => response, (error) => {
            const { status } = error.response || { status: 0 };
            if (status === 401) {
                this.$store.dispatch('auth/logout').then(() => {
                    this.$router.replace({ path: '/login', hash: 'expired' })
                        .catch(() => {});
                });
            }
            return Promise.reject(error);
        });
    },
    watch: {
        $route() {
            Vue.prototype.$modal.hideAll();
        },
    },
    computed: {
        isLogged() {
            return this.$store.getters['auth/isLogged'];
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
