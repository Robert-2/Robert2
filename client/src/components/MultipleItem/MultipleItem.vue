<template>
  <div class="MultipleItem">
    <div
      v-for="(itemId, index) in itemsIds"
      :key="itemId"
      class="MultipleItem__item FormField"
    >
      <label class="FormField__label">
        {{ $t(label) }} {{ index + 1 }}
      </label>
      <div class="MultipleItem__value-field">
        <span
          v-if="fieldOptions.length === 0"
          class="MultipleItem__value-field--loading"
        >
          <i class="fas fa-spin fa-spinner" />
        </span>
        <span
          v-if="fieldOptions.length > 0 && !getItemLabel(itemId)"
          class="MultipleItem__value-field--error"
        >
          <i class="fas fa-exclamation-triangle" />
          {{$t('item-not-found', { item: $t(label) })}}
        </span>
        <span v-else>{{ getItemLabel(itemId) }}</span>
      </div>
      <button
        class="MultipleItem__item-action-btn danger"
        :title="$t('remove-item', { item: $t(label) })"
        @click="(e) => { e.preventDefault(); removeItem(itemId); }"
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
        :options="selectableOptions"
        @input="insertNewItem"
      />
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

<script>
import VueSelect from 'vue-select';

export default {
  name: 'MultipleItem',
  components: { VueSelect },
  props: {
    label: String,
    field: String,
    fieldOptions: Array,
    initialItemsIds: Array,
  },
  data() {
    const defaultItem = { value: null, label: this.$t('please-choose') };

    return {
      itemsIds: [...this.initialItemsIds] || [],
      askNewItem: false,
      newItem: defaultItem,
      defaultItem,
    };
  },
  computed: {
    selectableOptions() {
      return this.fieldOptions.filter(
        (option) => !this.itemsIds.includes(option.value),
      );
    },
  },
  methods: {
    getItemLabel(id) {
      const itemOption = this.fieldOptions.find(
        (option) => option.value === id,
      );
      return itemOption ? itemOption.label : '';
    },

    startAddItem(e) {
      e.preventDefault();
      this.askNewItem = true;
    },

    insertNewItem() {
      if (!this.newItem || !this.newItem.value) {
        return;
      }
      this.itemsIds.push(this.newItem.value);

      this.askNewItem = false;
      this.newItem = this.defaultItem;
      this.$emit('itemsUpdated', this.itemsIds);
    },

    cancelNewItem(e) {
      e.preventDefault();
      this.askNewItem = false;
      this.newItem = this.defaultItem;
    },

    removeItem(id) {
      this.itemsIds = this.itemsIds.filter((_id) => _id !== id);
      this.$emit('itemsUpdated', this.itemsIds);
    },
  },
};
</script>
