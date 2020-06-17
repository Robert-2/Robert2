<template>
  <div class="content Attributes">
    <div class="Attributes__header header-page">
      <Help
        :message="help"
        :error="error"
        :isLoading="isLoading"
      />
      <button @click="goBack" class="info Attributes__back-button">
        <i class="fas fa-arrow-left" />
        {{ $t('page-attributes.go-back-to-material') }}
      </button>
    </div>
    <div class="content__main-view">
      <div class="Attributes__content">
        <table class="Attributes__items">
          <thead class="Attributes__items__header">
            <tr>
              <th class="Attributes__items__name">
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="attribute in attributes" :key="attribute.id">
              <td class="Attributes__items__name">
                {{ attribute.name }}
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
