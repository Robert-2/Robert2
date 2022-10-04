<template>
    <div class="EventStep5Overview">
        <h1 class="EventStep5Overview__title">{{ event.title }}</h1>
        <div class="EventStep5Overview__header">
            <section class="EventStep5Overview__section">
                <h2 class="EventStep5Overview__dates-location">
                    <i class="fas fa-map-marker-alt" />
                    <span v-if="event.location"> {{ $t('in', { location: event.location }) }}, </span>
                    {{ $t('from-date-to-date', fromToDates) }}
                </h2>
            </section>
            <section class="EventStep5Overview__section">
                <h2 class="EventStep5Overview__duration">
                    <i class="far fa-clock" />
                    {{ $t('duration') }} {{ $t('days-count', { duration }, duration) }}
                </h2>
            </section>
        </div>
        <p v-if="event.description" class="EventStep5Overview__description">
            <i class="fas fa-clipboard" />
            {{ event.description }}
        </p>
        <div class="EventStep5Overview__main">
            <section v-if="event.beneficiaries.length > 0" class="EventStep5Overview__section">
                <dl class="EventStep5Overview__info EventStep5Overview__info--vertical">
                    <dt class="EventStep5Overview__info__term">
                        <i class="fas fa-address-book" />
                        {{ $t('page.event-edit.event-beneficiaries') }}
                    </dt>
                    <dd class="EventStep5Overview__info__value">
                        <ul class="EventStep5Overview__info__list">
                            <li
                                v-for="beneficiary in event.beneficiaries"
                                :key="beneficiary.id"
                                class="EventStep5Overview__info__list-item"
                            >
                                <router-link
                                    :to="`/beneficiaries/${beneficiary.id}`"
                                    :title="$t('action-edit')"
                                >
                                    {{ beneficiary.full_name }}
                                </router-link>
                                <router-link
                                    v-if="beneficiary.company"
                                    :to="`/companies/${beneficiary.company.id}`"
                                    :title="$t('action-edit')"
                                >
                                    ({{ beneficiary.company.legal_name }})
                                </router-link>
                            </li>
                        </ul>
                    </dd>
                </dl>
            </section>
            <section v-if="event.technicians.length > 0" class="EventStep5Overview__section">
                <dl class="EventStep5Overview__info EventStep5Overview__info--vertical">
                    <dt class="EventStep5Overview__info__term">
                        <i class="fas fa-people-carry" />
                        {{ $t('page.event-edit.event-technicians') }}
                    </dt>
                    <dd class="EventStep5Overview__info__value">
                        <ul class="EventStep5Overview__info__list">
                            <li
                                v-for="technician in technicians"
                                :key="technician.id"
                                class="EventStep5Overview__info__list-item"
                            >
                                <router-link
                                    :key="technician.id"
                                    :to="`/technicians/${technician.id}/view#infos`"
                                    class="EventStep5Overview__info__link"
                                    :title="$t('action-edit')"
                                >
                                    {{ technician.name }}
                                </router-link>
                                <span v-if="technician.phone">− {{ technician.phone }}</span>
                                <br />
                                <ul class="EventStep5Overview__technician-periods">
                                    <li
                                        v-for="period in technician.periods"
                                        :key="period.id"
                                        class="EventStep5Overview__technician-periods__item"
                                    >
                                        {{ period.from.format('DD MMM LT') }} ⇒
                                        {{ period.to.format('DD MMM LT') }} :
                                        {{ period.position }}
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </dd>
                </dl>
            </section>
        </div>
        <div class="EventStep5Overview__materials">
            <h3 class="EventStep5Overview__materials__title">
                <i class="fas fa-box" />
                {{ $t('page.event-edit.event-materials') }}
            </h3>
            <MaterialsSorted
                v-if="hasMaterials"
                :data="event.materials"
                :withRentalPrices="showBilling && event.is_billable"
                :hideDetails="showBilling && event.is_billable"
            />
        </div>
        <h3 v-if="showBilling && event.is_billable" class="EventStep5Overview__billing-title">
            <i class="fas fa-file-invoice-dollar" />
            {{ $t('billing') }}
        </h3>
        <div class="EventStep5Overview__billing">
            <EventTotals
                v-if="hasMaterials"
                :event="event"
                :withRentalPrices="showBilling && event.is_billable"
                :forcedDiscountRate="discountRate"
            />
            <tabs
                v-if="showBilling && hasMaterials && event.is_billable"
                :defaultIndex="hasBill ? 1 : 0"
                @select="handleChangeBillingTab"
                class="EventStep5Overview__billing__tabs"
            >
                <tab :title="$t('estimates')" icon="file-signature">
                    <div>
                        <EventEstimates
                            :event="event"
                            :loading="isCreating"
                            :deletingId="deletingId"
                            @discountRateChange="handleChangeDiscountRate"
                            @createEstimate="handleCreateEstimate"
                            @deleteEstimate="handleDeleteEstimate"
                        />
                        <Help :message="{ type: 'success', text: successMessage }" :error="error" />
                    </div>
                </tab>
                <tab :title="$t('bill')" icon="file-invoice-dollar">
                    <div>
                        <Help :message="{ type: 'success', text: successMessage }" :error="error" />
                        <EventBilling
                            :event="event"
                            :loading="isCreating"
                            @discountRateChange="handleChangeDiscountRate"
                            @createBill="handleCreateBill"
                        />
                    </div>
                </tab>
            </tabs>
            <p v-if="!hasMaterials" class="EventStep5Overview__materials__empty">
                <i class="fas fa-exclamation-triangle" />
                {{ $t('@event.warning-no-material') }}
            </p>
        </div>
        <div class="EventStep5Overview__missing-materials">
            <EventMissingMaterials :eventId="event.id" />
        </div>
    </div>
</template>

<script src="./index.js"></script>
