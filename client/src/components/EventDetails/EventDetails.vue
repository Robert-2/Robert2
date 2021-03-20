<template>
  <div class="EventDetails">
    <section v-if="isLoading" class="EventDetails__loading">
      <i class="fas fa-circle-notch fa-spin fa-2x" />
      {{ $t('page-calendar.loading-event') }}
    </section>
    <section v-if="!isLoading && event" class="EventDetails__content">
      <Header
        :event="event"
        @close="$emit('close')"
        @saved="handleSaved"
        @error="handleError"
      />
      <div class="EventDetails__content__body">
        <Help
          :message="help"
          :error="error"
        />
        <tabs>
          <tab title-slot="infos">
            <div v-if="event.location" class="EventDetails__location">
              <i class="fas fa-map-marker-alt" />
              {{ $t('in') }}
              <strong>{{ event.location }}</strong>
              <a
                :href="`https://www.openstreetmap.org/search?query=${event.location}`"
                target="_blank"
                :title="$t('open-in-openstreetmap')"
              >
                &nbsp; <i class="fas fa-external-link-alt" />
              </a>
            </div>
            <div v-if="beneficiaries.length === 0" class="EventDetails__no-beneficiary">
              <i class="fas fa-exclamation-circle" />
              {{ $t('page-events.warning-no-beneficiary') }}
            </div>
            <div v-if="beneficiaries.length > 0" class="EventDetails__beneficiaries">
              <i class="fas fa-address-book" />
              {{ $t('for') }}
              <div
                v-for="beneficiary in beneficiaries"
                class="EventDetails__beneficiary"
                :key="beneficiary.id"
              >
                <router-link
                  :to="`/beneficiaries/${beneficiary.id}`"
                  :title="$t('action-edit')"
                >
                  {{ beneficiary.name }}
                </router-link>
                <router-link
                  v-if="beneficiary.company"
                  :to="`/companies/${beneficiary.company_id}`"
                  :title="$t('action-edit')"
                >
                  ({{ beneficiary.company }})
                </router-link>
              </div>
            </div>
            <div v-if="assignees.length > 0" class="EventDetails__assignees">
              <i class="fas fa-people-carry" />
              {{ $t('with') }}
              <div
                v-for="assignee in assignees"
                class="EventDetails__assignee"
                :key="assignee.id"
              >
                <router-link
                  :to="`/technicians/${assignee.id}`"
                  :title="$t('action-edit')"
                >
                  {{ assignee.name }}
                </router-link>
              </div>
            </div>
            <p v-if="event.description" class="EventDetails__description">
              <i class="fas fa-clipboard" />
              {{ event.description }}
            </p>
            <div
              v-if="hasMaterials && !event.isPast"
              class="EventDetails__confirmation"
              :class="{ 'EventDetails__confirmation--confirmed': event.is_confirmed }"
            >
              <p v-if="!event.is_confirmed">
                <i class="fas fa-hourglass-half" />
                {{ $t('page-events.event-not-confirmed-help') }}
              </p>
              <p v-if="event.is_confirmed">
                <i class="fas fa-check" />
                {{ $t('page-events.event-confirmed-help') }}
              </p>
            </div>
          </tab>
          <tab title-slot="materials" :disabled="!hasMaterials">
            <EventMissingMaterials :eventId="event.id" />
            <EventMaterials
              v-if="hasMaterials"
              :materials="event.materials"
              :start="event.startDate"
              :end="event.endDate"
              :withRentalPrices="showBilling && event.is_billable"
              :hideDetails="event.materials.length > 16"
            />
          </tab>
          <tab v-if="showBilling" title-slot="billing" :disabled="!hasMaterials">
            <EventBilling
              v-if="hasMaterials && event.is_billable"
              :beneficiaries="event.beneficiaries"
              :lastBill="lastBill"
              :materials="event.materials"
              :start="event.startDate"
              :end="event.endDate"
              :loading="billLoading"
              @discountRateChange="handleChangeDiscountRate"
              @createBill="handleCreateBill"
            />
            <div v-if="!event.is_billable" class="EventDetails__not-billable">
              <p>
                <i class="fas fa-ban" />
                {{ $t('event-not-billable') }}
              </p>
              <p v-if="!event.is_confirmed && userCanEditBill">
                <button @click="setEventIsBillable" class="success">
                  {{ $t('enable-billable-event') }}
                </button>
              </p>
            </div>
          </tab>
          <template slot="infos">
            <i class="fas fa-info-circle" /> {{ $t('informations') }}
          </template>
          <template slot="materials">
            <i class="fas fa-box" /> {{ $t('material') }}
          </template>
          <template slot="billing">
            <i class="fas fa-file-invoice-dollar" /> {{ $t('billing') }}
          </template>
        </tabs>
        <div v-if="hasMaterials" class="EventDetails__totals">
          <EventTotals
            :materials="event.materials"
            :withRentalPrices="showBilling && event.is_billable"
            :discountRate="discountRate"
            :start="event.startDate"
            :end="event.endDate"
          />
        </div>
        <div v-if="!hasMaterials" class="EventDetails__materials-empty">
          <p>
            <i class="fas fa-exclamation-triangle"></i>
            {{ $t('page-events.warning-no-material') }}
          </p>
          <router-link
            v-if="!event.isPast"
            :to="`/events/${event.id}`"
            v-slot="{ navigate }"
            custom
          >
            <button @click="navigate" class="info">
              <i class="fas fa-edit" /> {{ $t('page-events.edit-event') }}
            </button>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './EventDetails';
</style>

<script src="./index.js"></script>