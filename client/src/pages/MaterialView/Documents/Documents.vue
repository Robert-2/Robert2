<template>
    <div class="MaterialViewDocuments">
        <section class="MaterialViewDocuments__main">
            <p v-if="documents.length === 0" class="MaterialViewDocuments__no-document">
                {{ $t('page-materials-view.documents.no-document') }}
            </p>
            <ul v-if="documents.length > 0" class="MaterialViewDocuments__list">
                <DocumentItem
                    v-for="document in documents"
                    :key="document.id"
                    :file="document"
                    @remove="removeDocument"
                />
            </ul>
            <Help
                :message="help"
                :error="error"
                :isLoading="isLoading"
            />
        </section>
        <DocumentUpload :materialId="materialId" @uploadSuccess="handleUploadSuccess" />
    </div>
</template>

<style lang="scss">
  @import '../../../themes/default/index';
  @import './Documents';
</style>

<script src="./index.js"></script>
