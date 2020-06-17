<template>
  <div class="content">
    <div class="content__main-view">
      <div class="Technician">
        <PersonForm
          :person="person"
          :errors="errors"
          @submit="saveTechnician"
        />
        <Help
          :message="help"
          :error="error"
          :isLoading="isLoading"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Technician';
</style>

<script src="./index.js"></script>
