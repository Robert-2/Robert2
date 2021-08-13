<template>
    <div class="SideMenu">
        <router-link
            to="/"
            exact
            custom
            v-slot="{ navigate, isActive }"
        >
            <li
                @click="navigate"
                class="SideMenu__item"
                :class="{ 'SideMenu__item--active': isActive }"
            >
                <i class="fas fa-calendar-alt" /><br>
                <span class="SideMenu__item__title">{{$t('page-calendar.title')}}</span>
            </li>
        </router-link>
        <router-link
            v-if="isAdmin || isMember"
            to="/materials"
            custom
            v-slot="{ navigate, isActive }"
        >
            <li
                @click="navigate"
                class="SideMenu__item"
                :class="{ 'SideMenu__item--active': isActive }"
            >
                <i class="fas fa-box" /><br>
                <span class="SideMenu__item__title">{{$t('page-materials.title')}}</span>
            </li>
        </router-link>
        <router-link
            v-if="isAdmin || isMember"
            to="/technicians"
            custom
            v-slot="{ navigate, isActive }"
        >
            <li
                @click="navigate"
                class="SideMenu__item"
                :class="{ 'SideMenu__item--active': isActive }"
            >
                <i class="fas fa-people-carry" /><br>
                <span class="SideMenu__item__title">{{$t('page-technicians.title')}}</span>
            </li>
        </router-link>
        <router-link
            v-if="isAdmin || isMember"
            to="/beneficiaries"
            custom
            v-slot="{ navigate, isActive }"
        >
            <li
                @click="navigate"
                class="SideMenu__item"
                :class="{ 'SideMenu__item--active': isActive }"
            >
                <i class="fas fa-address-book" /><br>
                <span class="SideMenu__item__title">{{$t('page-beneficiaries.title')}}</span>
            </li>
        </router-link>
        <router-link
            v-if="isAdmin"
            to="/categories"
            custom
            v-slot="{ navigate, isActive }"
        >
            <li
                @click="navigate"
                class="SideMenu__item"
                :class="{ 'SideMenu__item--active': isActive }"
            >
                <i class="fas fa-sitemap" /><br>
                <span class="SideMenu__item__title">{{$t('page-categories.title')}}</span>
            </li>
        </router-link>
        <router-link
            v-if="isAdmin"
            to="/tags"
            custom
            v-slot="{ navigate, isActive }"
        >
            <li
                @click="navigate"
                class="SideMenu__item"
                :class="{ 'SideMenu__item--active': isActive }"
            >
                <i class="fas fa-tags" /><br>
                <span class="SideMenu__item__title">{{$t('page-tags.title')}}</span>
            </li>
        </router-link>
        <router-link
            v-if="isAdmin"
            to="/parks"
            custom
            v-slot="{ navigate, isActive }"
        >
            <li
                @click="navigate"
                class="SideMenu__item"
                :class="{ 'SideMenu__item--active': isActive }"
            >
                <i class="fas fa-industry" /><br>
                <span class="SideMenu__item__title">{{$t('page-parks.title')}}</span>
            </li>
        </router-link>
        <router-link
            v-if="isAdmin"
            to="/users"
            custom
            v-slot="{ navigate, isActive }"
        >
            <li
                @click="navigate"
                class="SideMenu__item"
                :class="{ 'SideMenu__item--active': isActive }"
            >
                <i class="fas fa-users-cog" /><br>
                <span class="SideMenu__item__title">{{$t('page-users.title')}}</span>
            </li>
        </router-link>
        <router-link
            v-if="isAdmin"
            to="/settings"
            custom
            v-slot="{ navigate, isActive }"
        >
            <li
                @click="navigate"
                class="SideMenu__item"
                :class="{ 'SideMenu__item--active': isActive }"
            >
                <i class="fas fa-sliders-h" /><br>
                <span class="SideMenu__item__title">{{$t('settings')}}</span>
            </li>
        </router-link>
    </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './SideMenu';
</style>

<script>
export default {
    name: 'SideMenu',
    computed: {
        isAdmin() {
            return this.$store.getters['auth/is']('admin');
        },
        isMember() {
            return this.$store.getters['auth/is']('member');
        },
    },
};
</script>
