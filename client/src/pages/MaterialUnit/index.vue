<template>
    <div class="content">
        <div class="content__main-view">
            <div class="MaterialUnit">
                <form class="Form" method="POST" @submit="handleSubmit">
                    <section class="Form__fieldset">
                        <h4 class="Form__fieldset__title">
                            {{ $t('informations') }}
                        </h4>
                        <FormField
                            v-model="unit.reference"
                            name="reference"
                            label="reference"
                            :errors="errors.reference"
                            required
                        />
                        <FormField
                            v-model="unit.park_id"
                            name="park_id"
                            label="park"
                            type="select"
                            :options="parksOptions"
                            :errors="errors.park_id"
                            required
                        />
                        <SelectSearch
                            :key="renderKey"
                            v-model="unit.person_id"
                            :selectedItemLabel="unit.owner ? unit.owner.full_name : null"
                            label="owner"
                            :formatOptions="formatOwnerOptions"
                            fetchEntity="persons"
                        />
                        <FormField
                            v-model="unit.serial_number"
                            name="serial_number"
                            label="serial-number"
                            :errors="errors.serial_number"
                        />
                        <FormField
                            v-model="unit.is_broken"
                            name="is_broken"
                            label="is-broken"
                            type="switch"
                            :errors="errors.is_broken"
                        />
                        <FormField
                            v-model="unit.is_lost"
                            name="is_lost"
                            label="is-lost"
                            type="switch"
                            :errors="errors.is_lost"
                        />
                        <FormField
                            v-model="unit.state"
                            name="state"
                            label="state"
                            type="select"
                            :options="statesOptions"
                            :errors="errors.state"
                        />
                        <FormField
                            v-model="unit.purchase_date"
                            name="purchase_date"
                            label="purchase-date"
                            type="date"
                            :errors="errors.purchase_date"
                            :datepickerOptions="datepickerOptions"
                        />
                        <FormField
                            v-model="unit.notes"
                            name="notes"
                            label="notes"
                            type="textarea"
                            :errors="errors.notes"
                        />
                    </section>
                    <section class="Form__actions">
                        <button class="Form__actions__save success" type="submit">
                            {{ $t('save') }}
                        </button>
                        <router-link
                            :to="`/materials/${materialId}/view#units`"
                            custom
                            v-slot="{ navigate }"
                        >
                            <button type="button" class="Form__actions__cancel" @click="navigate">
                                {{ $t('cancel') }}
                            </button>
                        </router-link>
                    </section>
                </form>
                <Help :message="help" :error="error" :isLoading="isLoading" />
            </div>
        </div>
    </div>
</template>

<script src="./index.js"></script>
