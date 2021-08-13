<template>
    <form class="Form EventStep2" method="POST" @submit="saveAndBack">
        <header class="EventStep2__header">
            <h1 class="EventStep2__title">{{ $t('page-events.event-beneficiaries') }}</h1>
        </header>
        <MultipleItem
            label="beneficiary"
            field="full_name"
            fetchEntity="persons"
            :fetchParams="fetchParams"
            :selectedItems="event.beneficiaries"
            @itemsUpdated="updateItems"
            createItemPath="/beneficiaries/new"
            :formatOptions="formatItemOptions"
            :getItemLabel="getItemLabel"
        />
        <p v-if="showBillingHelp" class="EventStep2__help">
            <i class="fas fa-info-circle" />
            {{ $t('page-events.beneficiary-billing-help') }}
        </p>
        <section class="EventStep2__footer">
            <button class="info" type="submit">
                <i class="fas fa-arrow-left" />
                {{ $t('page-events.save-and-back-to-calendar') }}
            </button>
            <button class="success" @click="saveAndNext">
                {{ $t('page-events.save-and-continue') }}
                <i class="fas fa-arrow-right" />
            </button>
        </section>
    </form>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Step2';
</style>

<script src="./index.js"></script>
