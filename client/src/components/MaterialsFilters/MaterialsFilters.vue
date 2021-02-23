<template>
  <div class="MaterialsFilters">
    <select
      v-if="parks.length > 1"
      v-model="filters.park"
      class="MaterialsFilters__park"
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
      class="MaterialsFilters__category"
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
      class="MaterialsFilters__sub-category"
      :disabled="selectedCategory.sub_categories.length === 0"
      @change="changeSubCategory"
    >
      <option value="">
        {{ $t('all-sub-categories') }}
      </option>
      <option
        v-for="subCategory in selectedCategory.sub_categories"
        :key="subCategory.id"
        :value="subCategory.id"
      >
        {{ subCategory.name }}
      </option>
    </select>
    <VueSelect
      v-model="filters.tags"
      class="MaterialsFilters__tags"
      :options="$store.getters['tags/options']"
      :placeholder="$t('tags')"
      @input="setQueryFilters"
      multiple
    />
    <button
      v-tooltip="$t('page-materials.clear-filters')"
      :disabled="isFilterEmpty"
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
