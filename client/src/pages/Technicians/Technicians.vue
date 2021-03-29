<template>
  <div class="content Technicians">
    <div class="content__header header-page">
      <div class="header-page__help">
        <Help
          :message="help"
          :error="error"
          :isLoading="isLoading"
        />
      </div>
      <div class="header-page__actions">
        <router-link :to="`/technicians/new`" v-slot="{ navigate }" custom>
          <button @click="navigate" class="Technicians__create success">
            <i class="fas fa-user-plus" />
            {{ $t('page-technicians.action-add') }}
          </button>
        </router-link>
      </div>
    </div>

    <div class="content__main-view">
      <v-server-table
        ref="DataTable"
        name="techniciansTable"
        :columns="columns"
        :options="options"
      >
        <div slot="email" slot-scope="technician">
          <a :href="`mailto:${technician.row.email}`">{{ technician.row.email }}</a>
        </div>
        <div slot="phone" slot-scope="technician">
          {{ technician.row.phone }}
        </div>
        <div slot="address" slot-scope="technician">
          {{ technician.row.street }}<br>
          {{ technician.row.postal_code }} {{ technician.row.locality }}
        </div>
        <div slot="note" slot-scope="technician">
          <pre>{{ technician.row.note }}</pre>
        </div>
        <div slot="actions" slot-scope="technician" class="Technicians__actions">
          <router-link
            v-if="!isTrashDisplayed"
            v-tooltip="$t('action-edit')"
            :to="`/technicians/${technician.row.id}`"
            v-slot="{ navigate }"
            custom
          >
            <button @click="navigate" class="item-actions__button info">
              <i class="fas fa-edit" />
            </button>
          </router-link>
          <button
            v-if="!isTrashDisplayed"
            v-tooltip="$t('action-trash')"
            class="item-actions__button warning"
            @click="deleteTechnician(technician.row.id)"
          >
            <i class="fas fa-trash" />
          </button>
          <button
            v-if="isTrashDisplayed"
            v-tooltip="$t('action-restore')"
            class="item-actions__button info"
            @click="restoreTechnician(technician.row.id)"
          >
            <i class="fas fa-trash-restore" />
          </button>
          <button
            v-if="isTrashDisplayed"
            v-tooltip="$t('action-delete')"
            class="item-actions__button danger"
            @click="deleteTechnician(technician.row.id)"
          >
            <i class="fas fa-trash-alt" />
          </button>
        </div>
      </v-server-table>
    </div>
    <div class="content__footer">
      <button
        class="Technicians__show-trashed"
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
  @import './Technicians';
</style>

<script src="./index.js"></script>
