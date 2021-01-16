<template>
  <div class="content Categories">
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
          class="Categories__create success"
          @click="addCategory()"
        >
          <i class="fas fa-plus" />
          {{ $t('page-categories.action-add') }}
        </button>
      </div>
    </div>

    <div class="content__main-view Categories__items">
      <div
        v-for="category in categories"
        :key="category.id"
        class="Categories__category"
      >
        <div class="Categories__category__name">
          <i class="fas fa-folder-open" />
          {{ category.name }}
          <div class="Categories__category__actions">
            <router-link
              v-tooltip="$t('page-categories.display-materials')"
              :to="`/materials?category=${category.id}`"
              class="Categories__link-button"
            >
              <i class="fas fa-eye" />
            </router-link>
            <button
              v-tooltip="$t('action-edit')"
              class="Categories__edit-button info"
              @click="editCategory(category.id, category.name)"
            >
              <i class="fas fa-edit" />
            </button>
            <button
              v-tooltip="$t('action-trash')"
              class="Categories__edit-button warning"
              @click="remove('categories', category.id)"
            >
              <i class="fas fa-trash" />
            </button>
          </div>
        </div>
        <div class="Categories__sub-categories">
          <div
            v-for="subCategory in category.sub_categories"
            :key="subCategory.id"
            class="Categories__sub-category"
          >
            <div class="Categories__sub-category__name">
              <i class="fas fa-arrow-right" />
              {{ subCategory.name }}
              <div class="Categories__sub-category__actions">
                <router-link
                  v-tooltip="$t('page-subcategories.display-materials')"
                  :to="`/materials?category=${category.id}&subCategory=${subCategory.id}`"
                  class="Categories__link-button"
                >
                  <i class="fas fa-eye" />
                </router-link>
                <button
                  v-tooltip="$t('action-edit')"
                  class="Categories__edit-button info"
                  @click="editSubCategory(subCategory.id, subCategory.name)"
                >
                  <i class="fas fa-edit" />
                </button>
                <button
                  v-tooltip="$t('action-trash')"
                  class="Categories__edit-button warning"
                  @click="remove('subcategories', subCategory.id)"
                >
                  <i class="fas fa-trash" />
                </button>
              </div>
            </div>
          </div>
          <a
            class="Categories__add-link"
            @click="addSubCategory(category.id, category.name)"
          >
            <i class="fas fa-plus" />
            {{ $t('page-subcategories.add') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Categories';
</style>

<script src="./index.js"></script>
