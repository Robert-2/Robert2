<template>
  <header class="EventDetailsHeader">
    <div
      v-tooltip.bottom="event.isConfirmed ? $t('confirmed') : $t('not-confirmed')"
      class="EventDetailsHeader__status"
    >
      <i v-if="!event.isConfirmed" class="far fa-calendar-times" />
      <i v-if="event.isConfirmed" class="fas fa-check" />
    </div>
    <div class="EventDetailsHeader__details">
      <h4 class="EventDetailsHeader__details__title">
        {{ event.title }}
      </h4>
      <div class="EventDetailsHeader__details__location-dates">
        {{ $t('from-date-to-date', fromToDates) }}
        <span v-if="event.isCurrent" class="EventDetailsHeader__details__in-progress">
          ({{ $t('in-progress') }})
        </span>
      </div>
    </div>
    <div class="EventDetailsHeader__actions">
      <router-link
        v-show="!isVisitor"
        :to="`/events/${event.id}`"
        :disabled="event.isConfirmed"
        v-slot="{ navigate }"
        custom
      >
        <button @click="navigate" class="info" >
          <i class="fas fa-edit" /> {{ $t('action-edit') }}
        </button>
      </router-link>
      <template v-if="event.isPastAndConfirmed" >
        <button
          v-show="!isVisitor"
          v-if="!event.isClosed"
          class="success"
          :disabled="event.materials && event.materials.length === 0"
          @click="closeEvent"
        >
          <i v-if="isClosing" class="fas fa-circle-notch fa-spin" />
          <i v-if="!isClosing" class="fas fa-check" />
          {{ $t('close-event') }}
        </button>
        <button
          v-show="!isVisitor"
          v-if="event.isClosed"
          class="danger"
          @click="reopenEvent"
        >
          <i v-if="isClosing" class="fas fa-circle-notch fa-spin" />
          <i v-if="!isClosing" class="fas fa-unlock-alt" />
          {{ $t('re-open-event') }}
        </button>
      </template>
      <template v-else>
        <button
          v-show="!isVisitor"
          v-if="!event.isConfirmed"
          class="success"
          :disabled="event.materials && event.materials.length === 0"
          @click="confirmEvent"
        >
          <i v-if="isConfirming" class="fas fa-circle-notch fa-spin" />
          <i v-if="!isConfirming" class="fas fa-check" />
          {{ $t('confirm-eventdetails') }}
        </button>
        <button
          v-show="!isVisitor"
          v-if="event.isConfirmed"
          class="warning"
          @click="unconfirmEvent"
        >
          <i v-if="isConfirming" class="fas fa-circle-notch fa-spin" />
          <i v-if="!isConfirming" class="fas fa-hourglass-half" />
          {{ $t('unconfirm-eventdetails') }}
        </button>
      </template>
      <a
        :href="eventSummaryPdfUrl"
        target="_blank"
        v-if="isPrintable"
        class="button outline"
      >
        <i class="fas fa-print" />
        {{ $t('print') }}
      </a>
    </div>
    <button class="close" @click="$emit('close')">
      <i class="fas fa-times" />
    </button>
  </header>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Header';
</style>

<script src="./index.js"></script>
