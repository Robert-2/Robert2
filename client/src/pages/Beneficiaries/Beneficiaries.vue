<template>
  <div class="content Beneficiaries">
    <div class="content__header header-page">
      <div class="header-page__help">
        <Help
          :message="help"
          :error="error"
          :isLoading="isLoading"
        />
      </div>
      <div class="header-page__actions">
        <router-link
          :to="`/beneficiaries/new`"
          tag="button"
          class="Beneficiaries__create success"
        >
          <i class="fas fa-user-plus" />
          {{ $t('page-beneficiaries.action-add') }}
        </router-link>
      </div>
    </div>

    <div class="content__main-view">
      <v-server-table
        ref="DataTable"
        name="BeneficiariesTable"
        :columns="columns"
        :options="options"
      >
        <div slot="company" slot-scope="beneficiary">
          <router-link
            v-if="beneficiary.row.company"
            v-tooltip="$t('action-edit')"
            :to="`/companies/${beneficiary.row.company.id}`"
            tag="a"
          >
            {{ beneficiary.row.company.legal_name }}
            <i class="fas fa-edit" />
          </router-link>
        </div>
        <div slot="email" slot-scope="beneficiary">
          <a :href="`mailto:${beneficiary.row.email}`">{{ beneficiary.row.email }}</a>
        </div>
        <div slot="phone" slot-scope="beneficiary">
          <div v-if="beneficiary.row.phone">
            {{ beneficiary.row.phone }}
          </div>
          <div v-if="beneficiary.row.company">
            {{ beneficiary.row.company.phone }}
          </div>
        </div>
        <div slot="address" slot-scope="beneficiary">
          <div
            v-if="beneficiary.row.company &&
              beneficiary.row.company.postal_code &&
              beneficiary.row.locality"
          >
            {{ beneficiary.row.company.street }}<br>
            {{ beneficiary.row.company.postal_code }} {{ beneficiary.row.company.locality }}
          </div>
          <div v-else>
            {{ beneficiary.row.street }}<br>
            {{ beneficiary.row.postal_code }} {{ beneficiary.row.locality }}
          </div>
        </div>
        <div slot="note" slot-scope="beneficiary">
          <pre v-if="beneficiary.row.company">{{ beneficiary.row.company.note }}</pre>
          <pre v-else>{{ beneficiary.row.note }}</pre>
        </div>
        <div slot="actions" slot-scope="beneficiary" class="Beneficiaries__actions">
          <router-link
            v-if="!isTrashDisplayed"
            v-tooltip="$t('action-edit')"
            :to="`/beneficiaries/${beneficiary.row.id}`"
            tag="button"
            class="item-actions__button info"
          >
            <i class="fas fa-edit" />
          </router-link>
          <button
            v-if="!isTrashDisplayed"
            v-tooltip="$t('action-trash')"
            class="item-actions__button warning"
            @click="deleteBeneficiary(beneficiary.row.id)"
          >
            <i class="fas fa-trash" />
          </button>
          <button
            v-if="isTrashDisplayed"
            v-tooltip="$t('action-restore')"
            class="item-actions__button info"
            @click="restoreBeneficiary(beneficiary.row.id)"
          >
            <i class="fas fa-trash-restore" />
          </button>
          <button
            v-if="isTrashDisplayed"
            v-tooltip="$t('action-delete')"
            class="item-actions__button danger"
            @click="deleteBeneficiary(beneficiary.row.id)"
          >
            <i class="fas fa-trash-alt" />
          </button>
        </div>
      </v-server-table>
    </div>
    <div class="content__footer">
      <button
        class="Beneficiaries__show-trashed"
        :class="isTrashDisplayed ? 'info' : 'warning'"
        @click="showTrashed()"
      >
        <span v-if="!isTrashDisplayed">
          <i class="fas fa-trash"></i>
          {{ $t('open-trash-bin') }}
        </span>
        <span v-if="isTrashDisplayed">
          <i class="fas fa-eye"></i>
          {{ $t('display-not-deleted-items') }}
        </span>
      </button>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Beneficiaries';
</style>

<script src="./index.js"></script>
