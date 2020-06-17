<template>
  <div class="MaterialsList">
    <header class="MaterialsList__header">
      <MaterialsFilter
        :baseRoute="`/events/${eventId}`"
        @change="refreshTableAndPagination"
      />
      <div class="MaterialsList__header__extra-filters">
        <div class="MaterialsList__header__extra-filters__filter">
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
      <v-server-table
        ref="DataTable"
        name="materialsListTable"
        :columns="columns"
        :options="options"
      >
        <div slot="remaining_quantity" slot-scope="material">
          <span
            class="MaterialsList__remaining"
            :class="{
              'MaterialsList__remaining--zero':
                material.row.remaining_quantity === getQuantity(material.row.id),
              'MaterialsList__remaining--empty':
                material.row.remaining_quantity < getQuantity(material.row.id),
            }"
          >
            {{ $t('remaining-count', {
              count: material.row.remaining_quantity - getQuantity(material.row.id)
            }) }}
          </span>
        </div>
        <div slot="price" slot-scope="material">
          {{ formatAmount(material.row.rental_price) }}
          <i class="fas fa-times" />
        </div>
        <Quantity
          slot="quantity"
          slot-scope="material"
          :key="`${material.row.id}-${renderId}`"
          :materialId="material.row.id"
          :initialQuantity="getQuantity(material.row.id)"
          :maxQuantity="material.row.remaining_quantity"
          @decrement="decrement(material.row.id)"
          @setQuantity="setQuantity"
          @increment="increment(material.row.id)"
        />
        <div slot="amount" slot-scope="material">
          {{ formatAmount(material.row.rental_price * getQuantity(material.row.id)) }}
        </div>
        <div slot="actions" slot-scope="material">
          <button
            v-if="getQuantity(material.row.id) > 0"
            class="warning"
            @click="setQuantity(material.row.id, 0)"
          >
            <i class="fas fa-backspace" />
          </button>
        </div>
      </v-server-table>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../themes/default/index';
  @import './MaterialsList';
</style>

<script src="./index.js"></script>
