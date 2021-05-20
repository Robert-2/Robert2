<template>
  <div class="content">
    <div class="content__main-view Beneficiary">
      <div class="Beneficiary__main">
        <PersonForm
          :person="person"
          :errors="errors"
          @submit="saveBeneficiary"
          withCompany
          withReference
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
  @import './Beneficiary';
</style>

<script src="./index.js"></script>
