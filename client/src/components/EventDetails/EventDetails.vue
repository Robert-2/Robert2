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
        @saved="handleSavedFromHeader"
        @deleted="handleDeletedFromHeader"
        @error="handleError"
      />
      <div class="EventDetails__content__body">
        <tabs :onSelect="handleChangeTab">
          <tab title-slot="infos">
            <Help :message="{ type: 'success', text: successMessage }" :error="error" />
            <div class="EventDetails__base-infos">
              <LocationText v-if="event.location" :location="event.location" />
              <PersonsList
                type="beneficiaries"
                :persons="beneficiaries"
                :warningEmptyText="$t('page-events.warning-no-beneficiary')"
              />
              <PersonsList
                type="technicians"
                :persons="assignees"
              />
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
              <div v-if="!event.is_confirmed">
                <i class="fas fa-hourglass-half" />
                {{ $t('page-events.event-not-confirmed-help') }}
              </div>
              <div v-if="event.is_confirmed">
                <i class="fas fa-check" />
                {{ $t('page-events.event-confirmed-help') }}
              </div>
            </div>
            <EventTotals
              :materials="event.materials"
              :withRentalPrices="showBilling && event.is_billable"
              :discountRate="discountRate"
              :start="event.startDate"
              :end="event.endDate"
            />
          </tab>
          <tab title-slot="materials" :disabled="!hasMaterials">
            <Help :message="{ type: 'success', text: successMessage }" :error="error" />
            <ReturnInventorySummary
              v-if="event.is_return_inventory_done"
              :eventId="event.id"
              :isDone="event.is_return_inventory_done"
              :materials="event.materials"
            />
            <EventMissingMaterials v-else :eventId="event.id" />
            <EventMaterials
              v-if="hasMaterials"
              :materials="event.materials"
              :start="event.startDate"
              :end="event.endDate"
              :withRentalPrices="showBilling && event.is_billable"
              :hideDetails="event.materials.length > 16"
            />
            <EventTotals
              :materials="event.materials"
              :withRentalPrices="showBilling && event.is_billable"
              :discountRate="discountRate"
              :start="event.startDate"
              :end="event.endDate"
            />
          </tab>
          <tab v-if="showBilling" title-slot="estimates" :disabled="!hasMaterials">
            <Help :message="{ type: 'success', text: successMessage }" :error="error" />
            <EventEstimates
              v-if="hasMaterials && event.is_billable"
              :beneficiaries="event.beneficiaries"
              :materials="event.materials"
              :estimates="event.estimates"
              :lastBill="lastBill"
              :start="event.startDate"
              :end="event.endDate"
              :loading="isCreating"
              :deletingId="deletingId"
              @createEstimate="handleCreateEstimate"
              @deleteEstimate="handleDeleteEstimate"
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
          <tab v-if="showBilling" title-slot="billing" :disabled="!hasMaterials">
            <Help :message="{ type: 'success', text: successMessage }" :error="error" />
            <EventBilling
              v-if="hasMaterials && event.is_billable"
              :beneficiaries="event.beneficiaries"
              :lastBill="lastBill"
              :lastEstimate="lastEstimate"
              :allBills="event.bills"
              :materials="event.materials"
              :start="event.startDate"
              :end="event.endDate"
              :loading="isCreating"
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
            <i
              v-if="hasMaterialsProblems"
              class="fas fa-exclamation-triangle"
            />
          </template>
          <template slot="estimates">
            <i class="fas fa-file-signature" /> {{ $t('estimates') }}
          </template>
          <template slot="billing">
            <i class="fas fa-file-invoice-dollar" /> {{ $t('bill') }}
          </template>
        </tabs>
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
