<template>
    <form
        class="Form Form--fixed-actions PersonForm"
        method="POST"
        @submit="doSubmit"
        @change="handleChange"
    >
        <section class="Form__fieldset">
            <h4 class="Form__fieldset__title">
                {{ $t('personnal-infos') }}
            </h4>
            <FormField
                v-model="person.first_name"
                name="first_name"
                label="first-name"
                required
                :errors="errors.first_name"
            />
            <FormField
                v-model="person.last_name"
                name="last_name"
                label="last-name"
                required
                :errors="errors.last_name"
            />
            <FormField
                v-if="withReference"
                v-model="person.reference"
                name="reference"
                label="reference"
                :errors="errors.reference"
            />
            <FormField
                v-if="!withCompany"
                v-model="person.nickname"
                name="nickname"
                label="nickname"
                :errors="errors.nickname"
            />
        </section>
        <section v-if="withCompany" class="Form__fieldset">
            <h4 class="Form__fieldset__title">
                {{ $t('company') }}
            </h4>
            <div class="PersonForm__company">
                <FormField
                    v-model="person.company_id"
                    name="company_id"
                    label="company"
                    type="select"
                    :options="companiesOptions"
                    :errors="errors.company_id"
                />
                <router-link
                    v-if="person.company_id"
                    :to="`/companies/${person.company_id}`"
                    v-slot="{ navigate }"
                    custom
                >
                    <button class="PersonForm__company__edit-btn info" @click="navigate">
                        <i class="fas fa-edit" /> {{ $t('page-companies.edit-btn') }}
                    </button>
                </router-link>
            </div>
            <router-link to="/companies/new" class="PersonForm__add-company">
                <i class="fas fa-plus" /> {{ $t('page-companies.create-new') }}
            </router-link>
        </section>
        <section class="Form__fieldset">
            <h4 class="Form__fieldset__title">
                {{ $t('contact') }}
            </h4>
            <FormField
                v-model="person.phone"
                name="phone"
                label="phone"
                class="PersonForm__phone"
                type="tel"
                :errors="errors.phone"
            />
            <FormField
                v-model="person.email"
                name="email"
                label="email"
                type="email"
                :errors="errors.email"
            />
            <FormField
                v-model="person.street"
                name="street"
                label="street"
                :errors="errors.street"
            />
            <FormField
                v-model="person.postal_code"
                name="postal_code"
                label="postal-code"
                class="PersonForm__postal-code"
                :errors="errors.postal_code"
            />
            <FormField
                v-model="person.locality"
                name="locality"
                label="city"
                :errors="errors.locality"
            />
            <FormField
                v-model="person.country_id"
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
                v-model="person.note"
                label="notes"
                name="note"
                type="textarea"
                class="PersonForm__notes"
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
  @import './PersonForm';
</style>

<script src="./index.js"></script>
