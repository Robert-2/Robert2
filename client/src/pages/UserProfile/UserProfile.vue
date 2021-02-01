<template>
  <div class="content">
    <div
      class="content__main-view UserProfile"
      :class="{ 'UserProfile--password-edit': isPasswordEdit }"
    >
      <h3 class="UserProfile__title">
        {{ $t('page-profile.you-are-group', { group: $t(groupId) }) }}
      </h3>
      <div class="UserProfile__content">
        <form class="Form" method="POST" @submit="saveUser">
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
          </section>
          <a
            v-if="!isPasswordEdit"
            role="button"
            class="UserProfile__password-edit-toggle"
            @click="togglePasswordEdit"
          >
            {{ $t('page-profile.edit-password') }}
          </a>
          <section class="Form__fieldset UserProfile__section-password">
            <h4 class="Form__fieldset__title">
              <a
                role="button"
                class="UserProfile__password-edit-cancel"
                @click="togglePasswordEdit"
              >
                {{ $t('cancel') }}
              </a>
              {{ $t('page-profile.edit-password') }}
            </h4>
            <FormField
              v-model="user.password"
              name="password"
              label="password"
              type="password"
              :errors="errors.password"
            />
            <FormField
              v-model="user.password_confirmation"
              name="passwordConfirmation"
              label="page-profile.password-confirmation"
              type="password"
            />
          </section>
          <section class="Form__fieldset UserProfile__section-infos">
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
              class="UserProfile__postal-code"
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
            <button
              class="Form__actions__save success"
              type="submit"
            >
              {{ $t('save') }}
            </button>
          </section>
        </form>
        <div class="UserProfile__extras">
          <Help
            :message="help"
            :error="error"
            :isLoading="isLoading"
          />
          <div class="UserProfile__extras__buttons">
            <router-link to="/settings" v-slot="{ navigate }" custom>
              <button @click="navigate" class="info">
                <i class="fas fa-cogs" />
                {{ $t('your-settings') }}
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
  @import './UserProfile';
</style>

<script src="./index.js"></script>
