<template>
  <div class="SideMenu">
    <router-link
      to="/"
      tag="li"
      exact
      class="SideMenu__item"
    >
      <i class="fas fa-calendar-alt" /><br>
      <span class="SideMenu__item__title">{{$t('page-calendar.title')}}</span>
    </router-link>
    <router-link
      v-if="isAdmin || isMember"
      to="/materials"
      tag="li"
      class="SideMenu__item"
    >
      <i class="fas fa-box" /><br>
      <span class="SideMenu__item__title">{{$t('page-materials.title')}}</span>
    </router-link>
    <router-link
      v-if="isAdmin || isMember"
      to="/technicians"
      tag="li"
      class="SideMenu__item"
    >
      <i class="fas fa-people-carry" /><br>
      <span class="SideMenu__item__title">{{$t('page-technicians.title')}}</span>
    </router-link>
    <router-link
      v-if="isAdmin || isMember"
      to="/beneficiaries"
      tag="li"
      class="SideMenu__item"
    >
      <i class="fas fa-address-book" /><br>
      <span class="SideMenu__item__title">{{$t('page-beneficiaries.title')}}</span>
    </router-link>
    <router-link
      v-if="isAdmin"
      to="/categories"
      tag="li"
      class="SideMenu__item"
    >
      <i class="fas fa-sitemap" /><br>
      <span class="SideMenu__item__title">{{$t('page-categories.title')}}</span>
    </router-link>
    <router-link
      v-if="isAdmin"
      to="/tags"
      tag="li"
      class="SideMenu__item"
    >
      <i class="fas fa-tags" /><br>
      <span class="SideMenu__item__title">{{$t('page-tags.title')}}</span>
    </router-link>
    <router-link
      v-if="isAdmin"
      to="/parks"
      tag="li"
      class="SideMenu__item"
    >
      <i class="fas fa-industry" /><br>
      <span class="SideMenu__item__title">{{$t('page-parks.title')}}</span>
    </router-link>
    <router-link
      v-if="isAdmin"
      to="/users"
      tag="li"
      class="SideMenu__item"
    >
      <i class="fas fa-users-cog" /><br>
      <span class="SideMenu__item__title">{{$t('page-users.title')}}</span>
    </router-link>
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './SideMenu';
</style>

<script>
import store from '@/store';

export default {
  name: 'SideMenu',
  computed: {
    isAdmin() { return store.state.user.groupId === 'admin'; },
    isMember() { return store.state.user.groupId === 'member'; },
  },
};
</script>
