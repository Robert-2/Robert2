<template>
  <div class="MaterialsListQuantity">
    <button
      type="button"
      role="button"
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
      type="button"
      role="button"
      :class="{ info: quantity < material.remaining_quantity }"
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
    material: Object,
    initialQuantity: Number,
  },
  data: (vm) => (
    { quantity: vm.initialQuantity }
  ),
  methods: {
    // eslint-disable-next-line func-names
    updateQuantityDebounced: debounce(function () {
      this.$emit('setQuantity', this.material, this.quantity);
    }, 300),
  },
};
</script>
