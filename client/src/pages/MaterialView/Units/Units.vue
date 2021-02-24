<template>
  <div class="MaterialViewUnits">
    <v-client-table :data="material.units" :columns="columns" :options="options">
      <template #park="unit">
        {{ getParkName(unit.row.park_id) }}
      </template>
      <template #is_broken="unit">
        {{ unit.row.is_broken ? $t('yes') : $t('no') }}
      </template>
      <template #actions="unit">
          <router-link
            v-tooltip="$t('action-edit')"
            :to="`/materials/${material.id}/units/${unit.row.id}`"
            custom
            v-slot="{ navigate }"
          >
            <button class="item-actions__button info" @click="navigate">
              <i class="fas fa-edit" />
            </button>
          </router-link>
          <button
            v-tooltip="$t('action-delete')"
            class="item-actions__button danger"
            @click="deleteUnit(unit.row.id)"
          >
            <i class="fas fa-trash-alt" />
          </button>
        </template>
    </v-client-table>
  </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Units';
</style>

<script src="./index.js"></script>
