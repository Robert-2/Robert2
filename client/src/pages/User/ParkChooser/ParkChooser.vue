<template>
  <ul class="ParkChooser">
    <li
      v-for="park in allParks"
      :key="park.id"
      class="ParkChooser__park"
      :class="{ 'ParkChooser__park--selected': selectedParks.includes(park.id) }"
      role="button"
      @click="handleSelect(park.id)"
    >
      <i class="fas fa-ban" v-if="selectedParks.includes(park.id)" />
      <i class="fas fa-check" v-else />
      {{ park.name }}
    </li>
  </ul>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './ParkChooser';
</style>

<script src="./index.js"></script>
