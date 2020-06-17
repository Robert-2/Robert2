<template>
  <section class="EventTotals">
    <div v-if="withRentalPrices">
      <div class="EventTotals__base">
        {{ $t('total') }}:
        <span class="EventTotals__items-count">
          {{ $t('items-count', { count: itemsCount }) }}
        </span>
        <span class="EventTotals__daily-total">
          <i class="fas fa-arrow-right" />
          {{ formatAmount(total) }}
        </span>
        <span class="EventTotals__duration">
          <i class="fas fa-times" />
          {{ duration }} {{ duration > 1 ? $t('days') : $t('day') }}
        </span>
        <span class="EventTotals__ratio">
          <i class="fas fa-arrow-right" />
          {{ $t('ratio') }}&nbsp;{{ ratio }}
        </span>
      </div>
      <div class="EventTotals__grand">
        {{ $t('total-amount') }}:&nbsp;{{ formatAmount(grandTotal) }}
      </div>
      <div
        v-if="discountRate > 0 && totalDiscountable !== total"
        class="EventTotals__discountable"
      >
        {{ $t('total-discountable') }}:
        {{ formatAmount(totalDiscountable) }}&nbsp;/&nbsp;{{ $t('day') }}
        <i class="fas fa-arrow-right" />
        {{ formatAmount(grandTotalDiscountable) }}
      </div>
      <div v-if="discountRate > 0" class="EventTotals__discount">
        {{ $t('discount') }} {{ discountRate }} %
        <i class="fas fa-arrow-right" />
        - {{ formatAmount(discountAmount) }}
      </div>
      <div v-if="discountRate > 0" class="EventTotals__grand-discount">
        {{ $t('total-amount-with-discount') }}: {{ formatAmount(grandTotalWithDiscount) }}
      </div>
      <div v-if="duration > 1" class="EventTotals__daily">
        ({{ formatAmount(grandTotalWithDiscount / duration) }}&nbsp;/&nbsp;{{ $t('day') }})
      </div>
    </div>
    <div class="EventTotals__replacement">
      {{ $t('replacement-total') }}: {{ formatAmount(replacementTotal) }}
    </div>
  </section>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './EventTotals';
</style>

<script src="./index.js"></script>
