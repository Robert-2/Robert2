<template>
  <div class="content Materials">
    <div class="content__header header-page">
      <div class="header-page__help">
        <Help
          :message="help"
          :error="error"
          :isLoading="isLoading"
        />
      </div>
      <div class="header-page__actions">
        <MaterialsFilters
          baseRoute="/materials"
          @change="refreshTableAndPagination"
        />
        <router-link :to="`/materials/new`" v-slot="{ navigate }" custom>
          <button @click="navigate" class="Materials__create success">
            <i class="fas fa-plus" />
            {{ $t('page-materials.action-add') }}
          </button>
        </router-link>
      </div>
    </div>

    <div class="content__main-view">
      <v-server-table
        ref="DataTable"
        name="materialsTable"
        :columns="columns"
        :options="options"
      >
        <div slot="park" slot-scope="material">
          {{ getParkName(material.row.park_id) }}
        </div>
        <div slot="category" slot-scope="material">
          <i class="fas fa-folder-open" />
          {{ getCategoryName(material.row.category_id) }}
          <div v-if="material.row.sub_category_id">
            <i class="fas fa-arrow-right" />
            {{ getSubCategoryName(material.row.sub_category_id) }}
          </div>
        </div>
        <div slot="rental_price" slot-scope="material">
          {{ formatAmount(material.row.rental_price) }}
        </div>
        <div slot="replacement_price" slot-scope="material">
          {{ formatAmount(material.row.replacement_price) }}
        </div>
        <div
          slot="tags"
          slot-scope="material"
          class="Materials__tags-list"
          role="button"
          @click="setTags(material.row)"
        >
          <MaterialTags
            :tags="material.row.tags"
          />
          <span
            v-if="material.row.tags.length === 0 && !isTrashDisplayed"
            class="Materials__add-tags"
          >
            {{ $t('add-tags') }}
          </span>
        </div>
        <div slot="actions" slot-scope="material" class="Materials__actions">
          <router-link
            v-tooltip="$t('action-view')"
            :to="`/materials/${material.row.id}/view`"
            v-slot="{ navigate }"
            custom
          >
            <button @click="navigate" class="item-actions__button success">
              <i class="fas fa-eye" />
            </button>
          </router-link>
          <router-link
            v-if="!isTrashDisplayed"
            v-tooltip="$t('action-edit')"
            :to="`/materials/${material.row.id}`"
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
            @click="deleteMaterial(material.row.id)"
          >
            <i class="fas fa-trash" />
          </button>
          <button
            v-if="isTrashDisplayed"
            v-tooltip="$t('action-restore')"
            class="item-actions__button info"
            @click="restoreMaterial(material.row.id)"
          >
            <i class="fas fa-trash-restore" />
          </button>
          <button
            v-if="isTrashDisplayed"
            v-tooltip="$t('action-delete')"
            class="item-actions__button danger"
            @click="deleteMaterial(material.row.id)"
          >
            <i class="fas fa-trash-alt" />
          </button>
        </div>
      </v-server-table>
    </div>
    <div class="content__footer">
      <button
        class="Materials__show-trashed"
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
  @import './Materials';
</style>

<script src="./index.js"></script>
