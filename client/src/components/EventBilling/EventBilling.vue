<template>
  <section class="EventBilling">
    <div
      v-if="lastBill && !displayCreateBill && !loading"
      class="EventBilling__download"
    >
      <p class="EventBilling__download__text">
        {{ $t(
          'bill-number-generated-at',
          { number: lastBill.number, date: lastBill.date.format('L') }
        ) }}
        <span v-if="lastBill.discount_rate > 0">
          {{ $t('with-discount', { rate: lastBill.discount_rate }) }},
        </span>
        <span v-if="lastBill.discount_rate === 0">{{ $t('without-discount') }},</span>
        {{ $t('with-amount-of', { amount: formatAmount(lastBill.due_amount) }) }}.
      </p>
      <a :href="pdfUrl" class="EventBilling__download__link">
        <i class="fas fa-download" />
        {{ $t('download-pdf') }}
      </a>
    </div>
    <div v-if="lastBill && userCanEdit" class="EventBilling__regenerate">
      <p class="EventBilling__regenerate__text">
        {{ $t('regenerate-bill-help') }}
      </p>
      <a v-if="!displayCreateBill && !loading" href="#" @click="openBillRegeneration">
        <i class="fas fa-sync" />
        {{ $t('click-here-to-regenerate-bill') }}
      </a>
    </div>
    <div v-if="!isBillable" class="EventBilling__not-billable">
      <h3 class="EventBilling__not-billable__title">
        <i class="fas fa-exclamation-triangle" />
        {{ $t('missing-beneficiary') }}
      </h3>
      <p v-if="userCanEdit" class="EventBilling__not-billable__text">
        {{ $t('not-billable-help') }}<br />
        {{ $t('click-edit-to-create-one') }}
      </p>
    </div>
    <div v-if="!lastBill && isBillable">
      <div v-if="userCanEdit && !lastEstimate" class="EventBilling__no-estimate">
        {{ $t('warning-no-estimate-before-billing') }}
      </div>
      <p class="EventBilling__no-bill">
        {{ $t('no-bill-help') }}<br />
        <span v-if="userCanEdit">{{ $t('create-bill-help') }}</span>
        <span v-else>{{ $t('contact-someone-to-create-bill') }}</span>
      </p>
    </div>
    <BillEstimateCreationForm
      v-if="displayCreateBill || loading || (!lastBill && isBillable && userCanEdit)"
      :discountRate="discountRate"
      :discountTarget="discountTarget"
      :maxAmount="grandTotal"
      :beneficiary="beneficiaries[0]"
      :saveLabel="$t('create-bill')"
      :isRegeneration="!!lastBill"
      @change="handleChangeDiscount"
      @submit="createBill"
      @cancel="closeBillRegeneration"
      :loading="loading"
    />
  </section>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './EventBilling';
</style>

<script src="./index.js"></script>
