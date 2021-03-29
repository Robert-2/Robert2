<template>
  <div class="MultipleItem">
    <div
      v-for="(itemData, index) in notSavedSelectedItems"
      :key="itemData.id || `unknown-${index}`"
      class="MultipleItem__item FormField"
    >
      <label class="FormField__label">
        {{ $t(label) }} {{ index + 1 }}
      </label>
      <div class="MultipleItem__value-field">
        <span
          v-if="!itemData"
          class="MultipleItem__value-field--error"
        >
          <i class="fas fa-exclamation-triangle" />
          {{$t('item-not-found', { item: $t(label) })}}
        </span>
        <span v-else>{{ getItemLabel(itemData) || 'N/A' }}</span>
      </div>
      <button
        class="MultipleItem__item-action-btn danger"
        :title="$t('remove-item', { item: $t(label) })"
        @click="(e) => { e.preventDefault(); removeItem(itemData.id); }"
      >
        <i class="fas fa-trash-alt" />
      </button>
    </div>
    <div
      v-if="askNewItem"
      class="MultipleItem__item FormField"
    >
      <label class="FormField__label">
        {{ $t(label) }} {{ itemsIds.length + 1 }}
      </label>
      <VueSelect
        v-model="newItem"
        :filterable="false"
        :options="selectableOptions"
        @search="handleSearch"
        @input="insertNewItem"
      >
        <template #no-options="{ search }">
          <span v-if="search.length === 0">
            {{ $t('start-typing-to-search') }}
          </span>
          <span v-if="search.length > 0 && search.length < minSearchCharacters">
            {{ $t(
              'type-at-least-count-chars-to-search',
              { count: minSearchCharacters - search.length },
              minSearchCharacters - search.length,
            ) }}
          </span>
          <div v-if="search.length >= minSearchCharacters">
            <p>{{ $t('no-result-found-try-another-search') }}</p>
            <router-link :to="createItemPath" v-slot="{ navigate }" custom>
              <button @click="navigate" class="success">
                {{ $t('create-select-item-label', { label: $t(label) }) }}
              </button>
            </router-link>
          </div>
        </template>
      </VueSelect>
      <button
        class="MultipleItem__item-action-btn warning"
        :title="$t('cancel-add-item', { item: $t(label) })"
        @click="cancelNewItem"
      >
        <i class="fas fa-ban" />
      </button>
    </div>
    <div class="MultipleItem__actions">
      <button
        v-if="!askNewItem"
        class="success"
        @click="startAddItem"
      >
        <i class="fas fa-plus" />
        {{ $t('add-item', { item: $t(label) }) }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './MultipleItem';
</style>

<script src="./index.js"></script>
