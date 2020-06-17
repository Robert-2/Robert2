<template>
  <div class="SwitchToggle" :class="classnames" @click="handleSwitch">
    <div class="SwitchToggle__slide">
      <div class="SwitchToggle__button" />
    </div>
    <div class="SwitchToggle__label">
      <span v-if="value">{{ $t('yes') }}</span>
      <span v-if="!value">{{ $t('no') }}</span>
      <span v-if="locked && lockedReason" class="SwitchToggle__label__locked">
        ({{ $t('locked') }}: {{ lockedReason }})
      </span>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './SwitchToggle';
</style>

<script>
export default {
  name: 'SwitchToggle',
  props: {
    value: Boolean,
    locked: Boolean,
    lockedReason: String,
  },
  computed: {
    classnames() {
      return {
        'SwitchToggle--enabled': this.value,
        'SwitchToggle--locked': this.locked,
      };
    },
  },
  methods: {
    handleSwitch() {
      if (this.locked) {
        return;
      }

      this.$emit('input', !this.value);
    },
  },
};
</script>
