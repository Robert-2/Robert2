<template>
    <div class="content">
        <div class="content__main-view">
            <div class="Park">
                <form
                    class="Form Form--fixed-actions"
                    method="POST"
                    @submit="savePark"
                    @change="handleFormChange"
                >
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
                            <i class="fas fa-save" />
                            {{ $t('save') }}
                        </button>
                        <button type="button" @click="handleCancel">
                            <i class="fas fa-ban" />
                            {{ $t('cancel') }}
                        </button>
                    </section>
                </form>
                <div class="Park__sidebar">
                    <Help
                        :message="help"
                        :error="error"
                        :isLoading="isLoading"
                    />
                    <div v-if="!isNew" class="Park__totals">
                        <h3>{{ $t('page-parks.total-items') }}</h3>
                        <div v-if="park.total_items > 0" class="Park__totals__items">
                            <strong>
                                {{ $t('items-count', { count: park.total_items }, park.total_items) }}
                            </strong>
                            <span class="Park__totals__stock">
                                ({{ $t('stock-items-count', { count: park.total_stock_quantity }) }})
                            </span>
                            <br />
                            <br />
                            <router-link :to="`/materials?park=${park.id}`">
                                {{ $t('page-parks.display-materials-of-this-park') }}
                            </router-link>
                        </div>
                        <div v-if="park.total_items > 0" class="Park__totals__amount">
                            <span class="Park__totals__amount__title">{{ $t('total-amount') }} :</span>
                            <ParkTotalAmount v-if="park.total_items > 0" :parkId="park.id" />
                        </div>
                        <div v-else class="Park__totals__no-items">{{ $t('no-items') }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Park';
</style>

<script src="./index.js"></script>
