<template>
  <div class="EventMaterials">
    <div v-if="!showMaterialsList || materials.length > 30" class="EventMaterials__toggle">
      <button
        @click="showMaterialsList = !showMaterialsList"
        :class="{ info: !showMaterialsList }"
      >
        <i
          class="fas"
          :class="{ 'fa-eye': !showMaterialsList, 'fa-eye-slash': showMaterialsList }"
        />
        {{ $t(showMaterialsList ? 'hide-materials-details' : 'show-materials-details') }}
      </button>
    </div>
    <div v-if="showMaterialsList" class="EventMaterials__categories">
      <div
        v-for="(category, categIndex) in categories"
        :key="category.id"
        class="EventMaterials__category"
      >
        <h4 class="EventMaterials__title">
          {{ category.name }}
        </h4>
        <ul class="EventMaterials__list">
          <li
            v-for="material in category.materials"
            :key="material.id"
            class="EventMaterials__item"
          >
            <div class="EventMaterials__item__name">
              {{ material.name }}
            </div>
            <div v-if="withRentalPrices" class="EventMaterials__item__price">
              {{ formatAmount(material.rental_price) }}
            </div>
            <div class="EventMaterials__item__quantity">
              <i class="fas fa-times" />
              {{ material.pivot.quantity }}
            </div>
            <div v-if="withRentalPrices" class="EventMaterials__item__total">
              {{ formatAmount(material.pivot.quantity * material.rental_price) }}
            </div>
          </li>
        </ul>
        <div v-if="withRentalPrices" class="EventMaterials__subtotal">
          <button
            v-if="categIndex === categories.length - 1"
            @click="showMaterialsList = false"
          >
            <i class="fas fa-eye-slash" />
            {{ $t('hide-materials-details') }}
          </button>
          <div class="EventMaterials__subtotal__name">
            {{ $t('sub-total') }}
          </div>
          <div class="EventMaterials__subtotal__price">
            {{ formatAmount(category.subTotal) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './EventMaterials';
</style>

<script src="./index.js"></script>
