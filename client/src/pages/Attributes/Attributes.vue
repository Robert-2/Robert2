<template>
  <div class="content Attributes">
    <div class="Attributes__header header-page">
      <button @click="goBack" class="info Attributes__back-button">
        <i class="fas fa-arrow-left" />
        {{ $t('page-attributes.go-back-to-material') }}
      </button>
      <Help
        :message="help"
        :error="error"
        :isLoading="isLoading"
      />
    </div>
    <div class="content__main-view">
      <div class="Attributes__content">
        <table class="Attributes__items">
          <thead class="Attributes__items__header">
            <tr>
              <th class="Attributes__items__name" colspan="2">
                {{ $t('page-attributes.name') }}
              </th>
              <th class="Attributes__items__type">
                {{ $t('page-attributes.type') }}
              </th>
              <th class="Attributes__items__unit">
                {{ $t('page-attributes.unit') }}
              </th>
              <th class="Attributes__items__max-length">
                {{ $t('page-attributes.max-length') }}
              </th>
              <th class="Attributes__items__categories" colspan="2">
                {{ $t('page-attributes.limited-to-categories') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attribute in attributes" :key="attribute.id" class="Attributes__items__line">
              <td class="Attributes__items__name">
                <div v-if="editAttribute === attribute.id">
                  <input type="text" v-model="editAttributeName" />
                  <div v-if="errors.name" class="Attributes__items__name-error">
                    {{ errors.name[0] }}
                  </div>
                </div>
                <span v-else>{{ attribute.name }}</span>
              </td>
              <td class="Attributes__items__edit-name">
                <button
                  v-if="!editAttribute"
                  class="Attributes__items__edit-name__edit-button info"
                  @click="startEditAttribute(attribute.id, attribute.name)"
                >
                  <i class="fas fa-pen" />
                </button>
                <div v-if="editAttribute === attribute.id">
                  <button @click="cancelAttributeName()">
                    <i class="fas fa-ban" />
                  </button>
                  <button class="success" @click="saveAttributeName(attribute.id)">
                    <i class="fas fa-check" />
                  </button>
                </div>
              </td>
              <td class="Attributes__items__type">
                {{ $t(`page-attributes.type-${attribute.type}`) }}
              </td>
              <td class="Attributes__items__unit">
                {{ attribute.unit }}
              </td>
              <td class="Attributes__items__max-length">
                {{ attribute.max_length || (
                  attribute.type === 'string' ? $t('page-attributes.no-limit') : ''
                ) }}
              </td>
              <td class="Attributes__items__categories">
                <span
                  v-if="attribute.categories.length === 0"
                  class="Attributes__items__categories__empty"
                >
                  {{ $t('all-categories') }} ({{ $t('not-limited') }})
                </span>
                <span v-if="attribute.categories.length > 0">
                  {{ attribute.categories.map(({ name }) => name).join(', ') }}
                </span>
              </td>
              <td class="Attributes__items__delete">
                <button
                  v-if="!editAttribute"
                  class="Attributes__items__delete__button danger"
                  :class="{
                    'Attributes__items__delete__button--show': currentlyDeleting === attribute.id
                  }"
                  @click="deleteAttribute(attribute.id)"
                >
                  <i class="fas fa-trash" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!isAddingMode && attributes.length === 0" class="Attributes__no-data">
          {{ $t('page-attributes.no-attribute-yet') }}
        </p>
        <div class="Attributes__add-item">
          <AttributeEditForm
            ref="AttributeEditForm"
            v-if="isAddingMode"
            :errors="errors"
          />
          <div
            class="Attributes__actions"
            :class="{ 'Attributes__actions--add': isAddingMode }"
          >
            <button v-if="isAddingMode" class="success" @click="saveAttribute">
              {{ $t('save') }}
            </button>
            <button
              @click="toggleAddingMode"
              :class="{ success: !isAddingMode }"
            >
              <span v-if="!isAddingMode">
                <i class="fas fa-plus" />
                {{ $t('page-attributes.add-btn') }}
              </span>
              <span v-if="isAddingMode">
                {{ $t('cancel') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Attributes';
</style>

<script src="./index.js"></script>
