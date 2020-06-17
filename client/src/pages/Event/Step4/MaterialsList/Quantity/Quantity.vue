<template>
  <div class="MaterialsListQuantity">
    <button
      :class="{ info: quantity > 0 }"
      :disabled="quantity === 0"
      @click="$emit('decrement')"
    >
      <i class="fas fa-minus" />
    </button>
    <input
      class="MaterialsListQuantity__number"
      v-model="quantity"
      @input="updateQuantityDebounced"
      @focus="$event.target.select()"
    >
    <button
      :class="{ info: quantity < maxQuantity }"
      @click="$emit('increment')"
    >
      <i class="fas fa-plus" />
    </button>
  </div>
</template>

<style lang="scss">
  @import '../../../../../themes/default/index';
  @import './Quantity';
</style>

<script>
import debounce from 'debounce';

export default {
  name: 'MaterialsListQuantity',
  props: {
    materialId: Number,
    initialQuantity: Number,
    maxQuantity: Number,
  },
  data: (vm) => (
    { quantity: vm.initialQuantity }
  ),
  methods: {
    // eslint-disable-next-line func-names
    updateQuantityDebounced: debounce(function () {
      this.$emit('setQuantity', this.materialId, this.quantity);
    }, 300),
  },
};
</script>
