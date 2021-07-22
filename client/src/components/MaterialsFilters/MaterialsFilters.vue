<template>
  <div class="MaterialsFilters">
    <select
      v-if="parks.length > 1"
      v-model="filters.park"
      class="MaterialsFilters__item"
      :class="{ 'MaterialsFilters__item--is-active': filters.park !== '' }"
      @change="changePark"
    >
      <option value="">
        {{ $t('all-parks') }}
      </option>
      <option
        v-for="park in parks"
        :key="park.id"
        :value="park.id"
      >
        {{ park.name }}
      </option>
    </select>
    <select
      v-model="filters.category"
      class="MaterialsFilters__item"
      :class="{ 'MaterialsFilters__item--is-active': filters.category !== '' }"
      @change="changeCategory"
    >
      <option value="">
        {{ $t('all-categories') }}
      </option>
      <option
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </select>
    <select
      v-model="filters.subCategory"
      class="MaterialsFilters__item"
      :class="{ 'MaterialsFilters__item--is-active': filters.subCategory !== '' }"
      :disabled="subCategories.length === 0"
      @change="changeSubCategory"
    >
      <option value="">
        {{ $t('all-sub-categories') }}
      </option>
      <option
        v-for="subCategory in subCategories"
        :key="subCategory.id"
        :value="subCategory.id"
      >
        {{ subCategory.name }}
      </option>
    </select>
    <VueSelect
      v-model="filters.tags"
      class="MaterialsFilters__item"
      :class="{ 'MaterialsFilters__item--is-active': filters.tags.length > 0 }"
      :options="$store.getters['tags/options']"
      :placeholder="$t('tags')"
      @input="setQueryFilters"
      multiple
    />
    <button
      v-if="!isFilterEmpty"
      class="MaterialsFilters__reset warning"
      v-tooltip="$t('clear-filters')"
      @click="clearFilters"
    >
      <i class="fas fa-backspace" />
    </button>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './MaterialsFilters';
</style>

<script src="./index.js"></script>
