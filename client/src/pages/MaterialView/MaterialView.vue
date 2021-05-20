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
          <template slot="units">
            <i class="fas fa-qrcode" /> {{ $t('units') }}
          </template>
          <template slot="documents">
            <i class="fas fa-file-pdf" /> {{ $t('documents') }}
          </template>
          <template slot="availabilities">
            <i class="far fa-calendar-alt" /> {{ $t('page-materials-view.booking-periods.title') }}
          </template>

          <tab title-slot="infos">
            <Infos :material="material" />
          </tab>
          <tab title-slot="units" v-if="material.is_unitary">
            <Units
              :material="material"
              @error="displayError"
              @outdated="fetchMaterial"
            />
          </tab>
          <tab title-slot="documents">
            <Documents :material="material" />
          </tab>
          <tab title-slot="availabilities">
            <Availabilities :units="material.units" />
          </tab>

          <!-- Menu contextuel droit -->
          <template #right>
            <nav class="MaterialView__menu" v-if="selectedTabIndex === 1">
              <router-link
                v-tooltip="$t('action-add')"
                :to="`/materials/${material.id}/units/new`"
                custom
                v-slot="{ navigate }"
              >
                <button class="info" @click="navigate">
                  <i class="fas fa-plus" />
                  {{ $t('page-materials-view.add-unit') }}
                </button>
              </router-link>
            </nav>
          </template>
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
