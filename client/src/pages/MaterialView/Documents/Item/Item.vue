<template>
    <li
        class="MaterialViewDocumentsItem"
        :class="{ 'MaterialViewDocumentsItem--with-link': !!file.id }"
    >
        <div class="MaterialViewDocumentsItem__icon">
            <a
                v-if="file.id"
                :href="fileUrl"
                target="_blank" class="MaterialViewDocumentsItem__link"
                :title="$t('page-materials-view.documents.click-to-open')"
            >
                <i class="fas" :class="iconName" />
            </a>
            <span v-else class="MaterialViewDocumentsItem__no-link">
                <i class="fas" :class="iconName" />
            </span>
        </div>
        <div class="MaterialViewDocumentsItem__name">
            <a
                v-if="file.id"
                :href="fileUrl"
                target="_blank" class="MaterialViewDocumentsItem__link"
                :title="$t('page-materials-view.documents.click-to-open')"
            >
                {{ file.name }}
            </a>
            <span v-else class="MaterialViewDocumentsItem__no-link">
                {{ file.name }}
            </span>
        </div>
        <div class="MaterialViewDocumentsItem__size">
            {{ fileSize }}
        </div>
        <div class="MaterialViewDocumentsItem__actions">
            <button class="danger" @click="handleClickRemove"><i class="fas fa-trash" /></button>
        </div>
    </li>
</template>

<style lang="scss">
  @import '../../../../themes/default/index';
  @import './Item';
</style>

<script src="./index.js"></script>
