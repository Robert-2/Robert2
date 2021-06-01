<template>
  <div class="content">
    <div class="content__main-view">
      <div class="Settings">
        <tabs class="Settings__body">
          <template slot="material-units">
            <i class="fas fa-qrcode" /> {{ $t('page-settings.material-units.title') }}
          </template>

          <tab title-slot="material-units">
            <MaterialUnitSettings />
          </tab>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
