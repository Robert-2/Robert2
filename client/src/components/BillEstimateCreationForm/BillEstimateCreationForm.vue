<template>
  <form
    class="Form BillEstimateCreationForm"
    @submit="handleSubmit"
  >
    <div class="Form__fieldset">
      <h4 class="Form__fieldset__title">{{ $t('discount') }}</h4>
      <FormField
        :value="discountRate"
        class="BillEstimateCreationForm__discount-input"
        name="discountRate"
        type="number"
        :step="0.0001"
        :min="0.0"
        :max="99.9999"
        addon="%"
        label="wanted-rate"
        @change="handleChangeRate"
        :disabled="loading"
      />
      <FormField
        :value="discountTarget"
        class="BillEstimateCreationForm__discount-target-input"
        name="discountTarget"
        type="number"
        :step="0.01"
        :min="0"
        :max="maxAmount"
        :addon="currency"
        label="wanted-amount"
        @change="handleChangeAmount"
        :disabled="loading"
      />
      <div class="BillEstimateCreationForm__beneficiary">
        <div class="BillEstimateCreationForm__beneficiary__label">
          {{ $t('beneficiary') }}
        </div>
        <div class="BillEstimateCreationForm__beneficiary__name">
          <router-link
            :to="`/beneficiaries/${beneficiary.id}`"
            :title="$t('action-edit')"
          >
            {{ beneficiary.full_name }}
          </router-link>
        </div>
      </div>
    </div>
    <div class="BillEstimateCreationForm__save">
      <button class="success" type="submit" :disabled="loading">
        <i v-if="loading" class="fas fa-circle-notch fa-spin" />
        <i v-else class="fas fa-plus" />
        {{ saveLabel }}
      </button>
      <button v-if="isRegeneration" @click="$emit('cancel')" type="button" :disabled="loading">
        {{ $t('cancel') }}
      </button>
    </div>
  </form>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './BillEstimateCreationForm';
</style>

<script src="./index.js"></script>
