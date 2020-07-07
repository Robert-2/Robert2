<template>
  <div class="content Parks">
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
          :to="`/parks/new`"
          tag="button"
          class="success"
        >
          <i class="fas fa-user-plus" />
          {{ $t('page-parks.action-add') }}
        </router-link>
      </div>
    </div>

    <div class="content__main-view">
      <v-server-table
        ref="DataTable"
        name="ParksTable"
        :columns="columns"
        :options="options"
      >
        <div slot="name" slot-scope="park">
          {{ park.row.name }}
        </div>
        <div slot="address" slot-scope="park">
          {{ park.row.street }}<br>
          {{ park.row.postal_code }} {{ park.row.locality }}
        </div>
        <div slot="totalItems" slot-scope="park">
          <router-link :to="`/materials?park=${park.row.id}`">
            {{ $t('items-count', { count: park.row.total_items }, park.row.total_items) }}
          </router-link>
          <span v-if="park.row.total_items > 0" class="Parks__total-stock">
            ({{ $t('stock-items-count', { count: park.row.total_stock_quantity }) }})
          </span>
          <span class="Parks__total-amount">
            ({{ formatAmount(park.row.total_amount) }})
          </span>
        </div>
        <div slot="note" slot-scope="park">
          <pre>{{ park.row.note }}</pre>
        </div>
        <div slot="actions" slot-scope="park" class="Parks__actions">
          <router-link
            v-if="!isTrashDisplayed"
            v-tooltip="$t('action-edit')"
            :to="`/parks/${park.row.id}`"
            tag="button"
            class="item-actions__button info"
          >
            <i class="fas fa-edit" />
          </router-link>
          <button
            v-if="!isTrashDisplayed"
            v-tooltip="$t('action-trash')"
            class="item-actions__button warning"
            @click="deletePark(park.row.id)"
          >
            <i class="fas fa-trash" />
          </button>
          <button
            v-if="isTrashDisplayed"
            v-tooltip="$t('action-restore')"
            class="item-actions__button info"
            @click="restorePark(park.row.id)"
          >
            <i class="fas fa-trash-restore" />
          </button>
          <button
            v-if="isTrashDisplayed"
            v-tooltip="$t('action-delete')"
            class="item-actions__button danger"
            @click="deletePark(park.row.id)"
          >
            <i class="fas fa-trash-alt" />
          </button>
        </div>
      </v-server-table>
    </div>
    <div class="content__footer">
      <button
        class="Parks__show-trashed"
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
  @import './Parks';
</style>

<script src="./index.js"></script>
