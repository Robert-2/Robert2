<template>
  <div class="content">
    <div class="content__main-view">
      <Help
        :message="help"
        :error="error"
        :isLoading="isLoading"
      />
      <div class="MaterialView" v-if="!isLoading">
        <section class="MaterialView__infos">
          <h2>
            {{ material.reference }}
          </h2>
          <h3>
            <router-link :to="`/materials?${queryStringCategory}`">
              {{ categoryName }}
            </router-link>
            <span v-if="subCategoryName">/</span>
            <router-link
              :to="`/materials?${queryStringSubCategory}`"
              v-if="subCategoryName"
            >
              {{ subCategoryName }}
            </router-link>
            /
            {{ material.name }}
          </h3>
          <p>{{ material.description }}</p>
          <h3>{{ $t('quantities') }}</h3>
          <ul>
            <li>
              <strong>{{ material.stock_quantity }} en stock</strong>
            </li>
            <li v-if="material.out_of_order_quantity > 0">
              {{ material.out_of_order_quantity || 0 }} en panne
            </li>
          </ul>
          <div class="MaterialView__billing" v-if="showBilling">
            <h3>{{ $t('prices') }}</h3>
            <ul>
              <li>
                <strong>{{ $t('value-per-day', { value: rentalPrice }) }}</strong>
              </li>
              <li v-if="replacementPrice">
                {{ $t('replacement-price') }} {{ replacementPrice }}
              </li>
            </ul>
            <h3>{{ $t('billing') }}</h3>
            <p v-if="material.is_hidden_on_bill">
              {{ $t('material-not-displayed-on-bill') }}
            </p>
            <p v-if="material.is_discountable">
              {{ $t('material-is-discountable') }}
            </p>
          </div>
          <div
            class="MaterialView__attributes"
            v-if="material.attributes.length > 0"
          >
            <h3>{{ $t('special-attributes') }}</h3>
            <ul
              class="MaterialView__attributes__list"
              v-if="material.attributes.length > 0"
            >
              <li
                class="MaterialView__attributes__list__item"
                v-for="attribute in material.attributes"
                :key="attribute.id"
              >
                {{ attribute.name }}:
                <span v-if="attribute.type !== 'boolean'">
                  {{ attribute.value }}
                  {{ attribute.unit }}
                </span>
                <span v-if="attribute.type === 'boolean'">
                  {{ attribute.value ? $t('yes') : $t('no') }}
                </span>
              </li>
            </ul>
          </div>
          <div class="MaterialView__notes" v-if="material.note">
            <h3>{{ $t('notes') }}</h3>
            <p>{{ material.note }}</p>
          </div>
        </section>
        <section class="MaterialView__extras">
          <div class="MaterialView__actions">
            <router-link
              v-tooltip="$t('action-edit')"
              :to="`/materials/${material.id}`"
              tag="button"
              class="info"
            >
              <i class="fas fa-edit" />
              {{ $t('action-edit') }}
            </router-link>
          </div>
          <div class="MaterialView__categories">
            <p>{{ $t('category') }}: <strong>{{ categoryName }}</strong></p>
            <p v-if="subCategoryName">
              {{ $t('sub-category') }}: <strong>{{ subCategoryName }}</strong>
            </p>
          </div>
          <MaterialTags :tags="material.tags" />
          <div class="MaterialView__dates">
            <p>{{ $t('created-at') }} {{ createDate }}</p>
            <p>{{ $t('updated-at') }} {{ updateDate }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './MaterialView';
</style>

<script src="./index.js"></script>
