<template>
  <div class="CalendarHeader">
    <div class="CalendarHeader__left">
      <div class="CalendarHeader__center-date">
        <FormField
          v-model="centerDate"
          name="centerDate"
          label="page-calendar.center-on"
          type="date"
          :datepicker-options="datepickerOptions"
          @change="setCenterDate"
        />
      </div>
      <button
        class="CalendarHeader__button info"
        :disabled="isToday"
        @click="centerToday()"
        :title="$t('page-calendar.center-on-today')"
      >
        <i class="fas fa-compress-arrows-alt" />
        <span class="CalendarHeader__button__title">{{ $t('page-calendar.center-on-today') }}</span>
      </button>
      <button
        class="CalendarHeader__button info"
        @click="refresh()"
        :title="$t('action-refresh')"
      >
        <i class="fas fa-sync-alt" />
        <span class="CalendarHeader__button__title">{{ $t('action-refresh') }}</span>
      </button>
    </div>
    <div class="CalendarHeader__center">
      <div v-if="isLoading" class="CalendarHeader__loading">
        <i class="fas fa-circle-notch fa-spin" />
        {{ $t('help-loading') }}
      </div>
    </div>
    <div class="CalendarHeader__right">
      <router-link v-show="!isVisitor" :to="`/events/new`" tag="button" class="success">
        <i class="fas fa-plus" /> {{ $t('page-calendar.add-event') }}
      </router-link>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Header';
</style>

<script src="./index.js"></script>
