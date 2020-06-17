<template>
  <div class="Breadcrumb">
    <div
      v-for="step in steps"
      :key="step.id"
      class="Breadcrumb__step"
      :class="{
        'Breadcrumb__step--current': isCurrent(step),
        'Breadcrumb__step--active': isActive(step),
        'Breadcrumb__step--validated': !isCurrent(step) && isValidated(step),
      }"
      @click="openStep(step)"
    >
      <i v-if="isCurrent(step)" class="fas fa-arrow-right" />
      <i v-if="!isCurrent(step) && isValidated(step)" class="fas fa-check" />
      {{ step.id }} -
      <span class="Breadcrumb__step__name">
        {{ step.name }}
      </span>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Breadcrumb';
</style>

<script>
export default {
  name: 'Breadcrumb',
  props: ['event', 'steps', 'currentStep'],
  methods: {
    openStep(step) {
      if (!this.isActive(step)) {
        return;
      }
      this.$emit('openStep', step.id);
    },

    isCurrent(step) {
      return step.id === this.currentStep;
    },

    isActive(step) {
      const stepIndex = this.steps.findIndex((_step) => _step.id === step.id);
      if (stepIndex < 0) {
        return false;
      }

      const previousStep = this.steps[stepIndex - 1] || null;
      return (
        this.isCurrent(step)
        || this.isValidated(step)
        || (previousStep && this.isValidated(previousStep))
      );
    },

    isValidated(step) {
      let isValidated = true;
      step.fields.forEach((field) => {
        if (!this.event[field] || this.event[field].length === 0) {
          isValidated = false;
        }
      });
      return isValidated;
    },
  },
};
</script>
