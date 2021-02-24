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
              v-model="unit.serial_number"
              name="serial_number"
              label="serial-number"
              :errors="errors.serial_number"
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
            <FormField
              v-model="unit.is_broken"
              name="is_broken"
              label="is-broken"
              type="switch"
              :errors="errors.is_broken"
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

<style lang="scss">
  @import '../../themes/default/index';
  @import './MaterialUnit';
</style>

<script src="./index.js"></script>
