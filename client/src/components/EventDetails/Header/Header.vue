<template>
  <header class="EventDetailsHeader">
    <div class="EventDetailsHeader__status">
      <i :class="`fas fa-${mainIcon}`" />
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
        v-show="canModify"
        :to="`/events/${event.id}`"
        v-slot="{ navigate }"
        custom
      >
        <button @click="navigate" class="info" >
          <i class="fas fa-edit" /> {{ $t('action-edit') }}
        </button>
      </router-link>
      <button
        v-show="!isVisitor && !event.isPast"
        v-if="!event.isConfirmed"
        class="success"
        :disabled="event.materials && event.materials.length === 0"
        @click="confirmEvent"
      >
        <i v-if="isConfirming" class="fas fa-circle-notch fa-spin" />
        <i v-if="!isConfirming" class="fas fa-check" />
        {{ $t('confirm-event') }}
      </button>
      <button
        v-show="!isVisitor && !event.isPast"
        v-if="event.isConfirmed"
        class="warning"
        @click="unconfirmEvent"
      >
        <i v-if="isConfirming" class="fas fa-circle-notch fa-spin" />
        <i v-if="!isConfirming" class="fas fa-hourglass-half" />
        {{ $t('unconfirm-event') }}
      </button>
      <a
        :href="eventSummaryPdfUrl"
        target="_blank"
        v-if="isPrintable"
        class="button outline"
      >
        <i class="fas fa-print" />
        {{ $t('print') }}
      </a>
      <router-link
        v-show="event.isPast && !event.isArchived && !isVisitor"
        :to="`/event-return/${event.id}`"
        v-slot="{ navigate }"
        custom
      >
        <button @click="navigate" class="info" >
          <i class="fas fa-tasks" />
          {{ $t('return-inventory') }}
        </button>
      </router-link>
      <button
        v-show="!isVisitor && event.isInventoryDone"
        v-if="!event.isArchived"
        class="info"
        @click="archiveEvent"
      >
        <i v-if="isArchiving" class="fas fa-circle-notch fa-spin" />
        <i v-if="!isArchiving" class="fas fa-box" />
        {{ $t('archive-event') }}
      </button>
      <button
        v-show="!isVisitor && event.isInventoryDone"
        v-if="event.isArchived"
        @click="unarchiveEvent"
      >
        <i v-if="isArchiving" class="fas fa-circle-notch fa-spin" />
        <i v-if="!isArchiving" class="fas fa-box" />
        {{ $t('unarchive-event') }}
      </button>
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
