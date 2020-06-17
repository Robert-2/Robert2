<template>
  <div
    class="EventMiniSummary"
    :class="{
      'EventMiniSummary--confirmed': isConfirmed,
      'EventMiniSummary--not-saved': !isSaved
    }"
  >
    <div
      v-if="!isSaved"
      v-tooltip.right-end="$t('page-events.not-saved')"
      class="EventMiniSummary__not-saved"
    >
      <i class="fas fa-exclamation-triangle" />
    </div>
    <div v-if="title" class="EventMiniSummary__title">
      {{ title }}
    </div>
    <div v-if="location" class="EventMiniSummary__detail">
      {{ $t('in') }} {{ location }}
    </div>
    <div v-if="dates.start && dates.end" class="EventMiniSummary__detail">
      <span v-if="duration === 1">
        {{ $t('on-date', { date: fromToDates.from }) }}
      </span>
      <span v-if="duration > 1">
        {{ $t('from-date-to-date', fromToDates) }}
      </span>
      <br>
      {{ $t('duration-days', { duration }) }}
      <br>
      <span v-if="showPrices">
        {{ $t('ratio') }} {{ ratio }}
      </span>
    </div>
    <div v-if="showPrices" class="EventMiniSummary__total">
      {{ $t('total') }} <strong>{{ grandTotal }}</strong>
    </div>
    <div class="EventMiniSummary__detail">
      <span v-if="isConfirmed">
        <i class="fas fa-check" />
        {{ $t('confirmed') }}
      </span>
      <span v-else class="">
        <i class="far fa-question-circle" />
        {{ $t('not-confirmed') }}
      </span>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './MiniSummary';
</style>

<script src="./index.js"></script>
