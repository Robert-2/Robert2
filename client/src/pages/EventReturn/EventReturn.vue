<template>
  <div class="EventReturn">
    <EventReturnHeader
      :isLoading="isLoading"
      :error="error"
      :help="help"
      :eventData="event"
      @displayGroupChange="setDisplayGroup"
    />
    <div class="EventReturn__list">
      <div
        v-if="!isLoading && !isPast"
        class="EventReturn__error"
      >
        <p v-if="!error">
          <i class="fas fa-exclamation-triangle" />
          {{ $t('page-event-return.this-event-is-not-past') }}
        </p>
        <router-link to="/" v-slot="{ navigate }" custom>
          <button type="button" @click="navigate" class="info" >
            <i class="fas fa-arrow-left" />
            {{ $t('back-to-calendar') }}
          </button>
        </router-link>
      </div>
      <template v-if="!isLoading && isPast">
        <MaterialsList
          :listData="listData"
          :quantities="quantities"
          :errors="validationErrors"
          :isLocked="isDone"
          @setReturned="setReturned"
          @setBroken="setBroken"
        />
        <div class="EventReturn__footer">
          <div v-if="isDone" class="EventReturn__done">
            {{ $t('page-event-return.inventory-done') }}
          </div>
          <router-link to="/">
            <i class="fas fa-arrow-left" />
            {{ $t('back-to-calendar') }}
          </router-link>
          <template v-if="!isDone">
            <button
              type="button"
              class="EventReturn__action success"
              @click="save"
              :disabled="isSaving || isTerminating"
            >
              <span v-if="isSaving">
                <i class="fas fa-circle-notch fa-spin" /> {{ $t('saving') }}
              </span>
              <span v-else>
                <i class="fas fa-save" /> {{ $t('save') }}
              </span>
            </button>
            <button
              type="button"
              class="EventReturn__action info"
              @click="terminate"
              :disabled="isSaving || isTerminating"
              :title="$t('page-event-return.warning-terminate')"
            >
              <span v-if="isTerminating">
                <i class="fas fa-circle-notch fa-spin" /> {{ $t('saving') }}
              </span>
              <span v-else>
                <i class="fas fa-check" /> {{ $t('terminate') }}
              </span>
            </button>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script src="./index.js"></script>
