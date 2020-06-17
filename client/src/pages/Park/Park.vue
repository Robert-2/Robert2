<template>
  <div class="content">
    <div class="content__main-view">
      <div class="Park">
        <form class="Form" method="POST" @submit="savePark">
          <section class="Form__fieldset">
            <h4 class="Form__fieldset__title">
              {{ $t('minimal-infos') }}
              <span class="FormField__label__required">*</span>
            </h4>
            <FormField
              v-model="park.name"
              name="name"
              label="name"
              required
              :errors="errors.name"
            />
          </section>
          <section class="Form__fieldset">
            <h4 class="Form__fieldset__title">
              {{ $t('contact-details') }}
            </h4>
            <FormField
              v-model="park.street"
              name="street"
              label="street"
              :errors="errors.street"
            />
            <FormField
              v-model="park.postal_code"
              name="postal_code"
              label="postal-code"
              class="Park__postal-code"
              :errors="errors.postal_code"
            />
            <FormField
              v-model="park.locality"
              name="locality"
              label="city"
              :errors="errors.locality"
            />
            <FormField
              v-model="park.country_id"
              name="country_id"
              label="country"
              type="select"
              :options="countriesOptions"
              :errors="errors.country_id"
            />
          </section>
          <section class="Form__fieldset">
            <h4 class="Form__fieldset__title">
              {{ $t('other-infos') }}
            </h4>
            <FormField
              v-model="park.opening_hours"
              name="opening_hours"
              label="opening-hours"
              :errors="errors.opening_hours"
            />
            <FormField
              v-model="park.note"
              name="note"
              label="notes"
              type="textarea"
              :errors="errors.note"
            />
          </section>
          <section class="Form__actions">
            <button
              class="Form__actions__save success"
              type="submit"
            >
              {{ $t('save') }}
            </button>
          </section>
        </form>
        <Help
          :message="help"
          :error="error"
          :isLoading="isLoading"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Park';
</style>

<script src="./index.js"></script>
