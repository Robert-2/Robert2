<template>
  <li
    class="MaterialAvailabilitiesItem"
    :class="classnames"
    role="button"
    :data-item-id="data.id"
    @click="handleClick"
  >
    <h2 class="MaterialAvailabilitiesItem__quantity">
      {{ materialQuantity }}
    </h2>
    <div class="MaterialAvailabilitiesItem__quantity-text">
      {{ $t('into') }}
    </div>
    <div class="MaterialAvailabilitiesItem__icon">
      <i :class="`fas fa-${mainIcon}`" />
      <i v-if="data.hasNotReturnedMaterials" class="fas fa-exclamation-triangle" />
    </div>
    <div class="MaterialAvailabilitiesItem__main">
      <h3 class="MaterialAvailabilitiesItem__main__title">
        {{ data.title }} <span v-if="data.location">({{ data.location }})</span>
      </h3>
      <div class="MaterialAvailabilitiesItem__main__dates">
        <span v-if="isMultipleDayLong" >
          {{ $t('from-date-to-date', fromToDates) }}
        </span>
        <span v-else>
          {{ $t('on-date', { date: start.format('L') }) }}
        </span>
      </div>
    </div>
    <div class="MaterialAvailabilitiesItem__units" v-if="data.pivot.units.length > 0">
      <span class="MaterialAvailabilitiesItem__units__title">
        {{ $t('page-materials-view.booking-periods.used-units') }}
      </span>
      <br />
      {{ unitsDisplay }}
    </div>
    <div class="MaterialAvailabilitiesItem__readable-state">
      <span v-if="isCurrent">
        <i class="fas fa-sign-out-alt" />
        {{ $t('page-materials-view.booking-periods.currently-out') }}
      </span>
      <span v-if="!isPast && !isCurrent">
        <i class="fas fa-binoculars" />
        {{ $t(
          'page-materials-view.booking-periods.expected-to-be-out-on',
          { date: start.format('L') }
        ) }}
      </span>
      <span v-if="isPast">
        {{ $t('page-materials-view.booking-periods.done') }}
      </span>
    </div>
    <div class="MaterialAvailabilitiesItem__actions">
      <button class="info" @click="handleOpenEvent">{{ $t('open') }}</button>
    </div>
  </li>
</template>

<style lang="scss">
  @import '../../../../themes/default/index';
  @import './Item';
</style>

<script src="./index.js"></script>
