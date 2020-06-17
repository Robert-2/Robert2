<template>
  <form class="Form EventStep1" method="POST" @submit="saveAndBack">
    <section class="Form__fieldset">
      <h4 class="Form__fieldset__title">
        {{ $t('minimal-infos') }}
        <span class="FormField__label__required">*</span>
      </h4>
      <FormField
        v-model="event.title"
        name="title"
        label="title"
        required
        :errors="errors.title"
        @input="checkIsSavedEvent"
      />
      <div class="EventStep1__dates">
        <div class="EventStep1__dates__fields">
          <FormField
            v-model="event.start_date"
            name="start_date"
            label="start-date"
            type="date"
            required
            :errors="errors.start_date"
            :datepicker-options="startDatepickerOptions"
            @change="handleStartDateChange"
          />
          <FormField
            v-model="event.end_date"
            name="end_date"
            label="end-date"
            type="date"
            required
            :errors="errors.end_date"
            :datepicker-options="endDatepickerOptions"
            @change="refreshDateFieldLimit"
          />
        </div>
        <div v-if="duration > 0" class="EventStep1__dates__duration">
          {{ $t('duration-days', { duration }) }}
        </div>
      </div>
    </section>
    <section class="Form__fieldset">
      <h4 class="Form__fieldset__title">
        {{ $t('event-details') }}
      </h4>
      <FormField
        v-model="event.location"
        name="location"
        label="location"
        class="EventStep1__location"
        :errors="errors.location"
        @input="checkIsSavedEvent"
      />
      <FormField
        v-model="event.description"
        name="description"
        label="description"
        type="textarea"
        class="EventStep1__description"
        :errors="errors.description"
        @input="checkIsSavedEvent"
      />
      <div v-if="showIsBillable" class="EventStep1__is-billable">
        <FormField
          v-model="event.is_billable"
          name="is_billable"
          label="is-billable"
          type="switch"
          :errors="errors.is_billable"
          @change="checkIsSavedEvent"
        />
        <div class="EventStep1__is-billable__help">
          <i class="fas fa-arrow-right" />
          <span v-if="!event.is_billable">
            {{ $t(`is-not-billable-help`) }}
          </span>
          <span v-if="event.is_billable">
            {{ $t(`is-billable-help`) }}
          </span>
        </div>
      </div>
    </section>
    <section class="Form__actions">
      <button class="EventStep1__save-btn info" type="submit">
        <i class="fas fa-arrow-left" />
        {{ $t('page-events.save-and-back-to-calendar') }}
      </button>
      <button class="EventStep1__save-btn success" @click="saveAndNext">
        {{ $t('page-events.save-and-continue') }}
        <i class="fas fa-arrow-right" />
      </button>
    </section>
  </form>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Step1';
</style>

<script src="./index.js"></script>
