<template>
  <div class="content">
    <div class="content__main-view">
      <Help
        :message="help"
        :error="error"
        :isLoading="isLoading"
      />
      <div class="MaterialView" v-if="!isLoading">
        <tabs>
          <template slot="infos">
            <i class="fas fa-info-circle" /> {{ $t('informations') }}
          </template>
          <template slot="units">
            <i class="fas fa-qrcode" /> {{ $t('units') }}
          </template>
          <tab title-slot="infos">
            <Infos :material="material" />
          </tab>
          <tab title-slot="units" v-if="material.is_unitary">
            <Units :material="material" />
          </tab>
        </tabs>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './MaterialView';
</style>

<script src="./index.js"></script>
