<template>
  <div class="PersonsList">
    <div v-if="persons.length === 0 && warningEmptyText" class="PersonsList__nobody">
      <i class="fas fa-exclamation-circle" />
      {{ warningEmptyText }}
    </div>
    <div v-if="persons.length > 0" class="PersonsList__list">
      <span v-if="type === 'beneficiaries'">
        <i class="fas fa-address-book" />
        {{ $t('for') }}
      </span>
      <span v-if="type === 'technicians'">
        <i class="fas fa-people-carry" />
        {{ $t('with') }}
      </span>
      <div v-for="person in persons" class="PersonsList__item" :key="person.id">
        <router-link
          :to="`/${type}/${person.id}`"
          :title="$t('action-edit')"
        >
          {{ person.name }}
        </router-link>
        <router-link
          v-if="person.company"
          :to="`/companies/${person.company_id}`"
          :title="$t('action-edit')"
        >
          ({{ person.company }})
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './PersonsList';
</style>

<script>
export default {
  name: 'PersonsList',
  props: {
    persons: Array,
    type: String,
    warningEmptyText: String,
  },
};
</script>
