<template>
  <form class="Form CompanyForm" method="POST" @submit="doSubmit">
    <section class="Form__fieldset">
      <h4 class="Form__fieldset__title">
        {{ $t('informations') }}
      </h4>
      <FormField
        v-model="company.legal_name"
        name="legal_name"
        label="legal-name"
        required
        :errors="errors.legal_name"
      />
      <FormField
        v-model="company.phone"
        name="phone"
        label="phone"
        class="CompanyForm__phone"
        type="tel"
        :errors="errors.phone"
      />
    </section>
    <section class="Form__fieldset">
      <h4 class="Form__fieldset__title">
        {{ $t('address') }}
      </h4>
      <FormField
        v-model="company.street"
        name="street"
        label="street"
        :errors="errors.street"
      />
      <FormField
        v-model="company.postal_code"
        name="postal_code"
        label="postal-code"
        class="CompanyForm__postal-code"
        :errors="errors.postal_code"
      />
      <FormField
        v-model="company.locality"
        name="locality"
        label="city"
        :errors="errors.locality"
      />
      <FormField
        v-model="company.country_id"
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
        v-model="company.note"
        label="notes"
        name="note"
        type="textarea"
        class="CompanyForm__notes"
        :errors="errors.note"
      />
    </section>
    <section class="Form__actions">
      <button
        class="Form__actions__save success"
        type="submit"
      >
        <i class="fas fa-save" />
        {{ $t('save') }}
      </button>
      <button type="button" @click="goBack">
        <i class="fas fa-ban" />
        {{ $t('cancel') }}
      </button>
    </section>
  </form>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './CompanyForm';
</style>

<script src="./index.js"></script>
