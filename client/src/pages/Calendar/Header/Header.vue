<template>
  <div class="CalendarHeader">
    <div class="CalendarHeader__timeline-actions">
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
    <div class="CalendarHeader__filters">
      <div
        class="CalendarHeader__filter"
        :class="{ 'CalendarHeader__filter--active': !!filters.park }"
        v-if="parks.length > 1"
      >
        <select
          v-model="filters.park"
          class="CalendarHeader__filter__select"
          @change="handleFilterParkChange"
        >
          <option value="">
            {{ $t('page-calendar.display-all-parks') }}
          </option>
          <option
            v-for="park in parks"
            :key="park.id"
            :value="park.id"
          >
            {{ park.name }}
          </option>
        </select>
      </div>
      <div
        class="CalendarHeader__filter"
        :class="{ 'CalendarHeader__filter--active': filters.hasMissingMaterials }"
      >
        <label class="CalendarHeader__filter__label">
          {{ $t('page-calendar.event-with-missing-material-only') }}
        </label>
        <SwitchToggle
          :value="filters.hasMissingMaterials"
          @input="handleFilterMissingMaterialChange"
        />
      </div>
    </div>
    <div class="CalendarHeader__loading-container">
      <div v-if="isLoading" class="CalendarHeader__loading">
        <i class="fas fa-circle-notch fa-spin" />
        {{ $t('help-loading') }}
      </div>
    </div>
    <div class="CalendarHeader__actions">
      <router-link
        v-show="!isVisitor"
        :to="`/events/new`"
        v-slot="{ navigate }"
        custom
      >
        <button @click="navigate" class="success">
          <i class="fas fa-plus" /> {{ $t('page-calendar.add-event') }}
        </button>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Header';
</style>

<script src="./index.js"></script>
