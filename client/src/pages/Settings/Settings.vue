<template>
  <div class="content">
    <div class="content__main-view">
      <div class="Settings">
        <tabs class="Settings__body">
          <template slot="event-summary">
            <i class="fas fa-print" /> {{ $t('page-settings.event-summary.title') }}
          </template>

          <tab title-slot="event-summary">
            <EventSummarySettings />
          </tab>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
