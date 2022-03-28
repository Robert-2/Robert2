<template>
    <section
        class="MaterialViewDocumentsUpload"
        :class="{ 'MaterialViewDocumentsUpload--drag-over': isDragging }"
        @drop.prevent="addFiles"
        @dragover.prevent="handleDragover"
        @dragleave.prevent="handleDragleave"
    >
        <h2 class="MaterialViewDocumentsUpload__title">
            {{ $t('page-materials-view.documents.drag-and-drop-files-here') }}
        </h2>
        <p>{{ $t('page-materials-view.documents.max-size', { size: maxSize }) }}</p>
        <button class="MaterialViewDocumentsUpload__choose-files info" @click="openFilesBrowser">
            {{ $t('page-materials-view.documents.choose-files') }}
        </button>
        <ul class="MaterialViewDocumentsUpload__send-list">
            <DocumentItem
                v-for="file in files"
                :key="file.name"
                :file="file"
                @remove="removeFile"
            />
        </ul>
        <ul v-if="fileErrors.length > 0" class="MaterialViewDocumentsUpload__file-errors">
            <li
                v-for="fileError in fileErrors"
                class="MaterialViewDocumentsUpload__file-errors__item"
                :key="fileError.fileName"
            >
                <i class="fas fa-exclamation-triangle" />
                {{ fileError.fileName }} &rarr; {{ fileError.message }}
            </li>
        </ul>
        <div class="MaterialViewDocumentsUpload__actions">
            <button
                v-if="files.length > 0"
                class="MaterialViewDocumentsUpload__actions__send-files success"
                :disabled="isLoading"
                @click="uploadFiles"
            >
                <i class="fas fa-upload" />
                {{ $t('page-materials-view.documents.send-files', { count: files.length }, files.length) }}
            </button>
            <input
                type="file"
                multiple
                @change="addFiles"
                ref="chooseFilesButton"
                class="MaterialViewDocumentsUpload__actions__file-input"
            />
            <Help message="" :error="error" :isLoading="isLoading" />
        </div>
        <Progressbar v-if="uploadProgress > 0" :percent="uploadProgress" />
    </section>
</template>

<script src="./index.js"></script>
