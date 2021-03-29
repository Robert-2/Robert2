<template>
  <div class="content">
    <div class="content__main-view UserSettings">
      <h3 class="UserSettings__title">
        {{ $t('page-settings.interface') }}
      </h3>
      <div class="UserSettings__content">
        <form class="Form" method="POST" @submit.prevent="save">
          <section class="Form__fieldset">
            <FormField
              v-model="settings.language"
              name="language"
              label="page-settings.language"
              type="select"
              :options="langsOptions"
              :errors="errors.language"
            />
            <FormField
              v-model="settings.auth_token_validity_duration"
              name="auth_token_validity_duration"
              label="page-settings.auth-token-validity-duration"
              type="number"
              class="UserSettings__hours"
              :addon="$t('hours')"
              :errors="errors.auth_token_validity_duration"
            />
          </section>
          <section class="Form__actions">
            <button
              class="Form__actions__save success"
              type="submit"
            >
              {{ $t('save') }}
            </button>
          </section>
        </form>
        <div class="UserSettings__extras">
          <Help
            :message="help"
            :error="error"
            :isLoading="isLoading"
          />
          <div class="UserSettings__extras__buttons">
            <router-link to="/profile" v-slot="{ navigate }" custom>
              <button @click="navigate" class="info">
                <i class="fas fa-user-alt" />
                {{ $t('your-profile') }}
              </button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './UserSettings';
</style>

<script src="./index.js"></script>
