<template>
  <form class="Form EventStep3" method="POST" @submit="saveAndBack">
    <section class="Form__fieldset">
      <h4 class="Form__fieldset__title">
        {{ $t('page-events.event-technicians') }}
      </h4>
      <MultipleItem
        label="technician"
        field="full_name"
        :field-options="assigneesOptions"
        :initial-items-ids="assigneesIds"
        @itemsUpdated="updateItems"
      />
    </section>
    <section class="Form__actions">
      <button class="EventStep3__save-btn info" type="submit">
        <i class="fas fa-arrow-left" />
        {{ $t('page-events.save-and-back-to-calendar') }}
      </button>
      <button class="EventStep3__save-btn success" @click="saveAndNext">
        {{ $t('page-events.save-and-continue') }}
        <i class="fas fa-arrow-right" />
      </button>
    </section>
  </form>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Step3';
</style>

<script src="./index.js"></script>
