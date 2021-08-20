<template>
    <div class="content">
        <div class="content__main-view">
            <div class="User">
                <form
                    class="Form Form--fixed-actions"
                    method="POST"
                    @submit="saveUser"
                    @change="handleFormChange"
                >
                    <section class="Form__fieldset">
                        <h4 class="Form__fieldset__title">
                            {{ $t('connexion-infos') }}
                        </h4>
                        <FormField
                            v-model="user.pseudo"
                            name="pseudo"
                            label="pseudo"
                            required
                            :errors="errors.pseudo"
                        />
                        <FormField
                            v-model="user.email"
                            name="email"
                            label="email"
                            type="email"
                            required
                            :errors="errors.email"
                        />
                        <FormField
                            v-if="!user.id"
                            v-model="user.password"
                            name="password"
                            label="password"
                            type="password"
                            required
                            :errors="errors.password"
                        />
                        <FormField
                            v-model="user.group_id"
                            name="group_id"
                            label="group"
                            type="select"
                            required
                            :options="groupOptions"
                            :errors="errors.group_id"
                        />
                    </section>
                    <section class="Form__fieldset">
                        <h4 class="Form__fieldset__title">
                            {{ $t('personnal-infos') }}
                        </h4>
                        <FormField
                            v-model="user.person.first_name"
                            name="first_name"
                            label="first-name"
                            :errors="errors.first_name"
                        />
                        <FormField
                            v-model="user.person.last_name"
                            name="last_name"
                            label="last-name"
                            :errors="errors.last_name"
                        />
                        <FormField
                            v-model="user.person.nickname"
                            name="nickname"
                            label="nickname"
                            :errors="errors.nickname"
                        />
                        <FormField
                            v-model="user.person.phone"
                            name="phone"
                            label="phone"
                            type="tel"
                            :errors="errors.phone"
                        />
                        <FormField
                            v-model="user.person.street"
                            name="street"
                            label="street"
                            :errors="errors.street"
                        />
                        <FormField
                            v-model="user.person.postal_code"
                            name="postal_code"
                            label="postal-code"
                            class="User__postal-code"
                            :errors="errors.postal_code"
                        />
                        <FormField
                            v-model="user.person.locality"
                            name="locality"
                            label="city"
                            :errors="errors.locality"
                        />
                    </section>
                    <section class="Form__actions">
                        <button class="Form__actions__save success" type="submit">
                            <i class="fas fa-save" />
                            {{ $t('save') }}
                        </button>
                        <button type="button" @click="handleCancel">
                            <i class="fas fa-ban" />
                            {{ $t('cancel') }}
                        </button>
                    </section>
                </form>
                <Help :message="help" :error="error" :isLoading="isLoading" />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    @import '../../themes/default/index';
    @import './User';
</style>

<script src="./index.js"></script>
