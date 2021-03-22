<template>
  <div class="MaterialsList">
    <header class="MaterialsList__header">
      <MaterialsFilter
        :baseRoute="`/events/${eventId}`"
        @change="setFilters"
      />
      <div class="MaterialsList__header__extra-filters">
        <div v-if="hasMaterial" class="MaterialsList__header__extra-filters__filter">
          {{ $t('page-events.display-only-selected-materials') }}
          <SwitchToggle
            :value="showSelectedOnly"
            @input="handleToggleSelectedOnly"
          />
        </div>
      </div>
    </header>
    <div v-if="error" class="MaterialsList__error">{{ error }}</div>
    <div class="MaterialsList__main">
      <div v-if="isLoading" class="MaterialsList__loading">
        <i class="fas fa-circle-notch fa-spin fa-2x" />
        {{ $t('help-loading') }}
      </div>
      <v-client-table
        ref="DataTable"
        name="materialsListTable"
        :data="materials"
        :columns="columns"
        :options="tableOptions"
      >
        <div slot="qty" slot-scope="material">
          <span :key="`qty-${material.row.id}-${renderId}`">
            {{ getQuantity(material.row.id) > 0 ? `${getQuantity(material.row.id)}\u00a0×` : '' }}
          </span>
        </div>
        <div slot="remaining_quantity" slot-scope="material">
          <span
            :key="`remain-qty-${material.row.id}-${renderId}`"
            class="MaterialsList__remaining"
            :class="{
              'MaterialsList__remaining--zero':
                material.row.remaining_quantity === getQuantity(material.row.id),
              'MaterialsList__remaining--empty':
                material.row.remaining_quantity < getQuantity(material.row.id),
            }"
          >
            {{ $t('remaining-count', { count: getRemainingQuantity(material.row) }) }}
          </span>
        </div>
        <div slot="price" slot-scope="material">
          {{ formatAmount(material.row.rental_price) }}
          <i class="fas fa-times" />
        </div>
        <Quantity
          slot="quantity"
          slot-scope="material"
          :key="`quantities-${material.row.id}-${renderId}`"
          :materialId="material.row.id"
          :initialQuantity="getQuantity(material.row.id)"
          :maxQuantity="material.row.remaining_quantity"
          @decrement="decrement(material.row.id)"
          @setQuantity="setQuantity"
          @increment="increment(material.row.id)"
        />
        <div slot="amount" slot-scope="material">
          <span :key="`amount-${material.row.id}-${renderId}`">
            {{ formatAmount(material.row.rental_price * getQuantity(material.row.id)) }}
          </span>
        </div>
        <div slot="actions" slot-scope="material">
          <button
            :key="`clear-${material.row.id}-${renderId}`"
            v-show="getQuantity(material.row.id) > 0"
            type="button"
            role="button"
            class="warning"
            @click="setQuantity(material.row.id, 0)"
          >
            <i class="fas fa-backspace" />
          </button>
        </div>
      </v-client-table>
      <div v-if="!isLoading && hasMaterial" class="MaterialsList__add-more">
        <button
          v-if="showSelectedOnly"
          type="button"
          role="button"
          @click="handleToggleSelectedOnly(false)"
        >
          <i class="fas fa-plus" />
          {{ $t('page-events.display-all-materials-to-add-some') }}
        </button>
        <button
          v-if="!showSelectedOnly"
          type="button"
          role="button"
          @click="handleToggleSelectedOnly(true)"
        >
          <i class="fas fa-eye" />
          {{ $t('page-events.display-only-event-materials') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../themes/default/index';
  @import './MaterialsList';
</style>

<script src="./index.js"></script>
