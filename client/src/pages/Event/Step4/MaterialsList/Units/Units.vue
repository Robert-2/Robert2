<template>
  <div class="MaterialsListUnits">
    <div class="MaterialsListUnits__tables" v-if="units.length > 0">
      <table class="MaterialsListUnits__table MaterialsListUnits__table--header">
        <thead>
          <tr>
            <th class="MaterialsListUnits__heading MaterialsListUnits__heading--selector"></th>
            <th class="MaterialsListUnits__heading MaterialsListUnits__heading--reference">
              {{ $t('reference') }}
            </th>
            <th class="MaterialsListUnits__heading MaterialsListUnits__heading--is-broken">
              {{ $t('is-broken') }}
            </th>
            <th class="MaterialsListUnits__heading MaterialsListUnits__heading--park">
              {{ $t('park') }}
            </th>
          </tr>
        </thead>
      </table>
      <div class="MaterialsListUnits__body">
        <table class="MaterialsListUnits__table MaterialsListUnits__table--body">
          <tbody>
            <Unit
              v-for="unit in units"
              :key="unit.id"
              :data="unit"
              :isSelected="selected.includes(unit.id)"
              @toggle="handleToggleUnit(unit.id)"
            />
          </tbody>
        </table>
      </div>
    </div>
    <p class="MaterialsListUnits__empty" v-if="units.length === 0">
      {{ $t('page-events.no-units-available') }}
    </p>
  </div>
</template>

<style lang="scss">
  @import '../../../../../themes/default/index';
  @import './Units';
</style>

<script src="./index.js"></script>
