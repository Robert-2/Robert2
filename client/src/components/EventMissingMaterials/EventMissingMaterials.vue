<template>
    <div v-if="hasMissingMaterials || error" class="EventMissingMaterials">
        <h3 class="EventMissingMaterials__title">
            <i class="fas fa-box-open" />
            {{ $t('page-events.event-missing-materials') }}
        </h3>
        <p class="EventMissingMaterials__help">
            {{ $t('page-events.event-missing-materials-help') }}
        </p>
        <div v-if="error" class="EventMissingMaterials__error">
            {{ error }}
        </div>
        <ul class="EventMissingMaterials__list">
            <li
                v-for="missingMaterial in missingMaterials"
                :key="missingMaterial.id"
                class="EventMissingMaterials__item"
            >
                <div class="EventMissingMaterials__item__name">
                    {{ missingMaterial.name }}
                </div>
                <div class="EventMissingMaterials__item__quantity">
                    {{ $t('page-events.missing-material-count', getMissingCount(missingMaterial)) }}
                </div>
            </li>
        </ul>
    </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './EventMissingMaterials';
</style>

<script src="./index.js"></script>
