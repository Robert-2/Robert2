<template>
    <section class="EventEstimates">
        <ul
            v-if="hasEstimate && !displayCreateEstimate && !loading"
            class="EventEstimates__list"
        >
            <li
                v-for="(estimate, index) in event.estimates"
                :key="estimate.id"
                class="EventEstimates__list__item"
                :class="{ 'EventEstimates__list__item--old': index > 0 }"
            >
                <i class="fas fa-file-signature EventEstimates__list__item__icon" />
                <div class="EventEstimates__list__item__text">
                    {{ $t('estimate-item-help', formatDate(estimate.date)) }}<br />
                    <strong>{{ formatAmount(estimate.due_amount) }}</strong>
                    <span v-if="estimate.discount_rate === 0">
                        ({{ $t('without-discount') }}).
                    </span>
                    <span v-else>
                        ({{ $t('discount-rate', { rate: estimate.discount_rate }) }}).
                    </span>
                </div>
                <div class="EventEstimates__list__item__actions">
                    <a
                        :href="getPdfUrl(estimate.id)"
                        class="EventEstimates__list__item__download"
                        :class="{
                            'EventEstimates__list__item__download--disabled': deletingId === estimate.id
                        }"
                    >
                        <i class="fas fa-download" />
                        {{ $t('download') }}
                    </a>
                    <button
                        class="EventEstimates__list__item__delete danger"
                        @click="$emit('deleteEstimate', estimate.id)"
                        :disabled="!!deletingId"
                    >
                        <i class="fas fa-trash" />
                        {{ $t('action-delete') }}
                    </button>
                </div>
            </li>
        </ul>
        <div v-if="loading || deletingId" class="EventEstimates__loading">
            <i class="fas fa-circle-notch fa-spin" />
            {{ $t('loading') }}
        </div>
        <div v-if="userCanEdit && hasBill" class="EventEstimates__warning-has-bill">
            {{ $t('warning-event-has-bill') }}
        </div>
        <div
            v-if="hasEstimate && userCanEdit && !loading && !deletingId"
            class="EventEstimates__create-new"
        >
            <p class="EventEstimates__create-new__text">
                {{ $t('create-new-estimate-help') }}
            </p>
            <button
                v-if="!displayCreateEstimate"
                class="EventEstimates__create-new__button success"
                @click="openCreateEstimate"
            >
                <i class="fas fa-plus" />
                {{ $t('create-new-estimate') }}
            </button>
        </div>
        <div v-if="!isBillable" class="EventEstimates__not-billable">
            <h3 class="EventEstimates__not-billable__title">
                <i class="fas fa-exclamation-triangle" />
                {{ $t('missing-beneficiary') }}
            </h3>
            <p v-if="userCanEdit" class="EventEstimates__not-billable__text">
                {{ $t('not-billable-help') }}<br />
                {{ $t('click-edit-to-create-one') }}
            </p>
        </div>
        <div v-if="!hasEstimate && isBillable">
            <p class="EventEstimates__no-estimate">
                {{ $t('no-estimate-help') }}<br />
                <span v-if="userCanEdit">{{ $t('create-estimate-help') }}</span>
                <span v-else>{{ $t('contact-someone-to-create-estimate') }}</span>
            </p>
        </div>
        <BillingForm
            v-if="userCanCreateEstimate"
            :discountRate="discountRate"
            :discountTarget="discountTarget"
            :maxAmount="grandTotal"
            :maxRate="maxDiscountRate"
            :beneficiary="event.beneficiaries[0]"
            :saveLabel="$t('create-estimate')"
            :isRegeneration="hasEstimate"
            @change="handleChangeDiscount"
            @submit="handleCreateEstimate"
            @cancel="closeCreateEstimate"
            :loading="loading"
        />
    </section>
</template>

<style lang="scss">
    @import '../../themes/default/index';
    @import './EventEstimates';
</style>

<script src="./index.js"></script>
