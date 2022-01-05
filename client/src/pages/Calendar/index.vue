<template>
    <div class="content">
        <div class="content__header">
            <CalendarHeader
                ref="Header"
                :isLoading="isLoading"
                @set-center-date="setCenterDate"
                @refresh="getEventsData"
                @filterMissingMaterials="handleFilterMissingMaterial"
                @filterByPark="handleFilterByPark"
            />
        </div>
        <div ref="Container" class="content__main-view Calendar">
            <i class="fas fa-circle-notch fa-3x fa-spin Calendar__loading" />
            <Timeline
                ref="Timeline"
                class="Calendar__timeline"
                :items="filteredEvents"
                :options="timelineOptions"
                @itemOver="onItemOver"
                @itemOut="onItemOut"
                @itemMoved="onItemMoved"
                @itemRemove="onItemRemove"
                @itemRemoved="onItemRemoved"
                @doubleClick="onDoubleClick"
                @rangeChanged="onRangeChanged"
            />
            <div class="Calendar__footer">
                <Help :message="help" :error="error" />
                <CalendarCaption />
            </div>
        </div>
    </div>
</template>

<script src="./index.js"></script>
