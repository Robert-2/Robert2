<template>
  <section class="EventBilling">
    <div class="EventBilling__last-bill">
      <div
        v-if="lastBill && !displayCreateBill && !loading"
        class="EventBilling__last-bill__download"
      >
        <p class="EventBilling__last-bill__download__text">
          {{ $t(
            'download-bill-help1',
            { number: lastBill.number, date: lastBill.date.format('L') }
          ) }}
          <span v-if="discountRate > 0">{{ $t('download-bill-help2', { discountRate }) }},</span>
          <span v-if="discountRate === 0">{{ $t('without-discount') }},</span>
          {{ $t('download-bill-help3', { amount: formatAmount(lastBill.due_amount) }) }}.
        </p>
        <a :href="billPdfUrl" class="EventBilling__last-bill__download__link">
          <i class="fas fa-download" />
          {{ $t('download-bill-pdf') }}
        </a>
      </div>
      <div v-if="lastBill" class="EventBilling__last-bill__regenerate">
        <p class="EventBilling__last-bill__regenerate__text">
          {{ $t('regenerate-bill-help') }}
        </p>
        <a v-if="!displayCreateBill && !loading" href="#" @click="openBillRegeneration">
          <i class="fas fa-sync" />
          {{ $t('click-here-to-regenerate') }}
        </a>
      </div>
      <div v-if="!isBillable" class="EventBilling__last-bill__not-billable">
        <h3 class="EventBilling__last-bill__not-billable__title">
          <i class="fas fa-exclamation-triangle" />
          {{ $t('missing-beneficiary') }}
        </h3>
        <p class="EventBilling__last-bill__not-billable__text">
          {{ $t('not-billable-help') }}<br />
          {{ $t('click-edit-to-create-one') }}
        </p>
      </div>
      <p v-if="!lastBill && isBillable" class="EventBilling__last-bill__no-bill">
        {{ $t('no-bill-help') }}<br />
        {{ $t('create-bill-help') }}
      </p>
      <form
        v-if="displayCreateBill || loading || (!lastBill && isBillable)"
        class="Form EventBilling__last-bill__create"
        method="POST"
        @submit="createBill"
      >
        <div class="Form__fieldset">
          <h4 class="Form__fieldset__title">{{ $t('discount') }}</h4>
          <FormField
            v-model="discountRate"
            class="EventBilling__last-bill__discount-input"
            name="discountRate"
            type="number"
            :step="0.0001"
            :min="0"
            :max="99.9999"
            addon="%"
            label="wanted-rate"
            :disabled="loading"
          />
          <FormField
            :value="discountTarget"
            class="EventBilling__last-bill__discount-target-input"
            name="discountTarget"
            type="number"
            :step="0.01"
            :min="0"
            :max="grandTotal"
            :addon="currency"
            label="wanted-amount"
            @change="recalcDiscountRate"
            :disabled="loading"
          />
          <div class="EventBilling__last-bill__beneficiary">
            <label class="EventBilling__last-bill__beneficiary__label">
              {{ $t('beneficiary') }}
            </label>
            <div class="EventBilling__last-bill__beneficiary__name">
              <router-link
                :key="beneficiaries[0].id"
                :to="`/beneficiaries/${beneficiaries[0].id}`"
                :title="$t('action-edit')"
                tag="a"
              >
                {{ beneficiaries[0].full_name }}
              </router-link>
            </div>
          </div>
        </div>
        <div class="EventBilling__last-bill__save">
          <button class="success" type="submit">
            <i v-if="loading" class="fas fa-spinner fa-spin" />
            {{ $t('create-bill') }}
          </button>
          <button v-if="lastBill" @click="closeBillRegeneration" type="button">
            {{ $t('cancel') }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './EventBilling';
</style>

<script src="./index.js"></script>
