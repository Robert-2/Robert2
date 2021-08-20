<template>
    <div class="ImageWithUpload" :class="{ 'ImageWithUpload--empty': !url }">
        <img :src="imageSrc" :alt="name || 'No image'" class="ImageWithUpload__img" />
        <div v-show="!isLoading" class="ImageWithUpload__actions">
            <input
                type="file"
                ref="chooseFilesButton"
                @change="addFile"
                class="ImageWithUpload__upload-input"
                accept="image/*"
            />
            <button class="info" @click="openFilesBrowser">
                <template v-if="name">
                    <i class="fas fa-sync" />
                    {{ $t('change-the-picture') }}
                </template>
                <template v-else>
                    <i class="fas fa-plus" />
                    {{ $t('add-a-picture') }}
                </template>
            </button>
            <button
                v-if="newPicture || deletedPicture"
                class="warning"
                @click="cancelChangePicture"
            >
                <i class="fas fa-ban" />
                {{ $t('cancel') }}
            </button>
            <button v-if="name" class="danger" @click="removePicture">
                <i class="fas fa-trash" />
                {{ $t('remove-the-picture') }}
            </button>
        </div>
        <div v-if="fileError" class="ImageWithUpload__file-error">
            <i class="fas fa-exclamation-triangle" />
            {{ fileError }}
        </div>
        <Help message="" :error="error" :isLoading="isLoading" />
    </div>
</template>

<style lang="scss">
    @import '../../themes/default/index';
    @import './ImageWithUpload';
</style>

<script src="./index.js"></script>
