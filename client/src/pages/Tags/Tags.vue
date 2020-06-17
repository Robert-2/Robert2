<template>
  <div class="content Tags">
    <div class="content__header header-page">
      <div class="header-page__help">
        <Help
          :message="help"
          :error="error"
          :isLoading="isLoading"
        />
        <div v-if="validationError" class="header-page__error">
          {{ validationError }}
        </div>
      </div>
      <div class="header-page__actions">
        <button
          class="Tags__create success"
          @click="addTag()"
        >
          <i class="fas fa-plus" />
          {{ $t('page-tags.action-add') }}
        </button>
      </div>
    </div>

    <div
      v-if="!isTrashDisplayed"
      class="content__main-view Tags__items"
    >
      <h3 v-if="tags.length === 0" class="Tags__empty">
        {{ $t('page-tags.no-item') }}
      </h3>
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="Tags__item"
        :class="{ 'Tags__item--protected': isProtected(tag.name) }"
      >
        <span class="Tags__item__name">
          <i class="fas fa-tag" />
          {{ tag.name }}
        </span>
        <button
          v-if="!isProtected(tag.name)"
          v-tooltip="$t('action-edit')"
          class="Tags__edit-button info"
          @click="edit(tag.id, tag.name)"
        >
          <i class="fas fa-edit" />
        </button>
        <button
          v-if="!isProtected(tag.name)"
          v-tooltip="$t('action-trash')"
          class="Tags__edit-button warning"
          @click="remove(tag.id)"
        >
          <i class="fas fa-trash" />
        </button>
      </div>
    </div>
    <div
      v-if="isTrashDisplayed"
      class="content__main-view Tags__items"
    >
      <h3 v-if="deletedTags.length === 0" class="Tags__empty">
        {{ $t('page-tags.no-item-in-trash') }}
      </h3>
      <div
        v-for="deletedTag in deletedTags"
        :key="deletedTag.id"
        class="Tags__item Tags__item--deleted"
      >
        <span class="Tags__item__name">
          <i class="fas fa-tag" />
          {{ deletedTag.name }}
        </span>
        <button
          v-tooltip="$t('action-restore')"
          class="Tags__edit-button info"
          @click="restore(deletedTag.id)"
        >
          <i class="fas fa-trash-restore" />
        </button>
        <button
          v-tooltip="$t('action-delete')"
          class="Tags__edit-button danger"
          @click="remove(deletedTag.id)"
        >
          <i class="fas fa-trash-alt" />
        </button>
      </div>
    </div>
    <div class="content__footer">
      <button
        class="Tags__show-trashed"
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
  @import './Tags';
</style>

<script src="./index.js"></script>
