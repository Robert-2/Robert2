import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Document from './components/Document';
import UploadArea from './components/UploadArea';

import type { ComponentRef } from 'vue';
import type { ProgressCallback } from 'axios';
import type { PropType } from '@vue/composition-api';
import type { Document as DocumentType } from '@/stores/api/documents';

export enum FileManagerLayout {
    /**
     * Avec ce layout, la "drop-zone" et les fichiers en cours d'upload
     * seront affichés à côté de la liste des documents.
     */
    HORIZONTAL = 'horizontal',

    /**
     * Avec ce layout, la "drop-zone" et les fichiers en cours d'upload
     * seront affichés au-dessus de la liste des documents.
     */
    VERTICAL = 'vertical',
}

type Props = {
    /** La liste des documents déjà présents. */
    documents: DocumentType[],

    /** Fonction permettant de persister un nouveau document. */
    persister(file: File, signal: AbortSignal, onProgress: ProgressCallback): Promise<DocumentType>,

    /** Le type de layout à utiliser (@see {@link FileManagerLayout}) */
    layout?: FileManagerLayout,

    /** Est-ce que l'upload et la suppression des fichiers doivent être désactivés ? */
    readonly?: boolean,
};

/**
 * Gestionnaire de fichiers, avec zone de glisser-déposer
 * pour uploader des documents.
 */
const FileManager = defineComponent({
    name: 'FileManager',
    props: {
        documents: {
            type: Array as PropType<Required<Props>['documents']>,
            required: true,
        },
        persister: {
            type: Function as PropType<Required<Props>['persister']>,
            required: true,
        },
        layout: {
            type: String as PropType<Required<Props>['layout']>,
            default: FileManagerLayout.HORIZONTAL,
        },
        readonly: {
            type: Boolean as PropType<Required<Props>['readonly']>,
            default: false,
        },
    },
    emits: ['documentUploaded', 'documentDelete'],
    computed: {
        isEmpty(): boolean {
            return this.documents.length === 0;
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleDocumentUploaded(document: DocumentType) {
            if (this.readonly) {
                return;
            }
            this.$emit('documentUploaded', document);
        },

        handleDocumentDelete(id: DocumentType['id']) {
            if (this.readonly) {
                return;
            }
            this.$emit('documentDelete', id);
        },

        // ------------------------------------------------------
        // -
        // -    API Publique
        // -
        // ------------------------------------------------------

        /**
         * Indique si au moins un fichier est en cours d'upload ou non.
         *
         * @returns `true` si un fichier est en cours d'upload, `false` sinon.
         */
        isUploading(): boolean {
            const $uploadAreaRef = this.$refs.uploadArea as ComponentRef<typeof UploadArea>;
            return !!$uploadAreaRef?.isUploading();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `components.FileManager.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            isEmpty,
            readonly,
            layout,
            documents,
            persister,
            handleDocumentUploaded,
            handleDocumentDelete,
        } = this;

        return (
            <div class={['FileManager', `FileManager--${layout}`]}>
                <section class={['FileManager__files', { 'FileManager__files--empty': isEmpty }]}>
                    {isEmpty && (
                        <p class="FileManager__files__empty">
                            {__('no-document')}
                        </p>
                    )}
                    {!isEmpty && (
                        <ul class="FileManager__files__list">
                            {documents.map((document: DocumentType) => (
                                <Document
                                    key={document.id}
                                    file={document}
                                    onDelete={handleDocumentDelete}
                                    readonly={readonly}
                                />
                            ))}
                        </ul>
                    )}
                </section>
                {!readonly && (
                    <section class="FileManager__upload-area">
                        <UploadArea
                            ref="uploadArea"
                            persister={persister}
                            onUpload={handleDocumentUploaded}
                        />
                    </section>
                )}
            </div>
        );
    },
});

export default FileManager;
