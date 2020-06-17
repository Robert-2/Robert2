<template>
  <div class="content">
    <div class="content__header">
      <CalendarHeader
        ref="Header"
        :isLoading="isLoading"
        @set-center-date="setCenterDate"
        @refresh="getEventsData"
      />
    </div>
    <div ref="Container" class="content__main-view Calendar">
      <i class="fas fa-circle-notch fa-3x fa-spin Calendar__loading" />
      <Timeline
        ref="Timeline"
        class="Calendar__timeline"
        :items="events"
        :options="timelineOptions"
        :events="['itemover', 'itemout', 'doubleClick', 'items-remove', 'rangechanged']"
        @itemover="onItemOver"
        @itemout="onItemOut"
        @double-click="onDoubleClick"
        @items-remove="onRemoved"
        @rangechanged="onRangeChanged"
      />
      <Help
        :message="help"
        :error="error"
      />
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Calendar';
</style>

<script src="./index.js"></script>
