<template>
  <div class="content">
    <div class="content__main-view">
      <div class="MaterialView">
        <Help
          :message="help"
          :error="error"
          :isLoading="isLoading"
        />
        <tabs
          v-if="!isLoading"
          :onSelect="onSelectTab"
          :defaultIndex="selectedTabIndex"
          class="MaterialView__body"
        >
          <template slot="infos">
            <i class="fas fa-info-circle" /> {{ $t('informations') }}
          </template>
          <template slot="documents">
            <i class="fas fa-file-pdf" /> {{ $t('documents') }}
          </template>
          <tab title-slot="infos">
            <Infos :material="material" />
          </tab>
          <tab title-slot="documents">
            <Documents />
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
