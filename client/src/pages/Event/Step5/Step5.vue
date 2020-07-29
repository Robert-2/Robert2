<template>
  <div class="EventStep5">
    <EventOverview :event="event" />
    <section
      v-if="event.materials.length > 0"
      class="EventStep5__confirmation"
    >
      <h3 class="EventStep5__confirmation__title">
        {{ $t('page-events.event-confirmation') }}
      </h3>
      <div
        class="EventStep5__confirmation__help"
        :class="{ 'EventStep5__confirmation__help--confirmed': event.is_confirmed }"
      >
        <p v-if="!event.is_confirmed">
          <i v-if="!isConfirming" class="fas fa-hourglass-half" />
          {{ $t('page-events.event-not-confirmed-help') }}
        </p>
        <p v-if="event.is_confirmed">
          <i v-if="!isConfirming" class="fas fa-check" />
          {{ $t('page-events.event-confirmed-help') }}
        </p>
      </div>
      <div class="EventStep5__confirmation__actions">
        <button
          v-if="!event.is_confirmed"
          class="success"
          @click="confirmEvent"
        >
          <i v-if="isConfirming" class="fas fa-circle-notch fa-spin" />
          <i v-if="!isConfirming" class="fas fa-check" />
          {{ $t('set-event-confirmed') }}
        </button>
        <button
          v-if="event.is_confirmed"
          class="warning"
          @click="unconfirmEvent"
        >
          <i v-if="isConfirming" class="fas fa-circle-notch fa-spin" />
          <i v-if="!isConfirming" class="fas fa-hourglass-half" />
          {{ $t('set-back-event-pending') }}
        </button>
        <a
          v-if="event.beneficiaries.length > 0"
          :href="eventSummaryPdfUrl"
          target="_blank"
          class="EventStep5__confirmation__actions__print"
        >
          <i class="fas fa-print" />
          {{ $t('print-summary') }}
        </a>
      </div>
    </section>
    <section>
      <router-link
        to="/"
        tag="button"
        exact
        class="EventStep5__back-btn info"
      >
        <i class="fas fa-arrow-left" />
        {{ $t('page-events.back-to-calendar') }}
      </router-link>
    </section>
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Step5';
</style>

<script src="./index.js"></script>
