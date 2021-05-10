<template>
  <div class="MaterialViewAvailabilities">
    <div v-if="materialEvents.length === 0" class="MaterialViewAvailabilities__empty">
      <Help
        message=""
        :error="error"
        :isLoading="isLoading"
      />
      <p v-if="!isLoading">
        {{ $t('page-materials-view.booking-periods.this-material-has-never-been-out-yet') }}
      </p>
    </div>
    <ul
      ref="MaterialAvailabilitiesList"
      v-if="materialEvents.length > 0"
      class="MaterialViewAvailabilities__listing"
    >
      <MaterialAvailabilitiesItem
        v-for="materialEvent in materialEvents"
        :data="materialEvent"
        :units="units"
        :key="materialEvent.id"
        @click="handleClickItem"
        @openEvent="openEventModal"
      />
    </ul>
    <i class="fas fa-circle-notch fa-3x fa-spin MaterialViewAvailabilities__loading" />
    <Timeline
      ref="MaterialTimeline"
      class="MaterialViewAvailabilities__timeline"
      :items="materialEventsTimeline"
      :options="timelineOptions"
      @double-click="handleDoubleClickTimeline"
      @click="handleClickTimeline"
    />
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Availabilities';
</style>

<script src="./index.js"></script>
