import './index.scss';

import Queue from 'p-queue';
import { defineComponent } from '@vue/composition-api';
import { FileError, getFileError } from './_utils';
import uniqueId from 'lodash/uniqueId';
import DropZone from './DropZone';
import UploadItem from './Upload';

import type { ProgressCallback } from 'axios';
import type { PropType } from '@vue/composition-api';
import type { Document } from '@/stores/api/documents';

export type Upload = {
    uid: string,
    file: File,
    error: FileError | null,
    progress: number,
    isStarted: boolean,
    isFinished: boolean,
    isCancelled: boolean,
    signal: AbortSignal,
    cancel(): void,
};

type Props = {
    /** Fonction permettant de persister un nouveau document. */
    persister(file: File, signal: AbortSignal, onProgress: ProgressCallback): Promise<Document>,
};

type Data = {
    uploadQueue: Queue,
    uploads: Upload[],
};

/** Nombre d'upload simultanés maximum (au delà, les uploads seront placés dans une queue). */
const MAX_CONCURRENT_UPLOADS = 5;

// @vue/component
const FileManagerUploadArea = defineComponent({
    name: 'FileManagerUploadArea',
    props: {
        persister: {
            type: Function as PropType<Required<Props>['persister']>,
            required: true,
        },
    },
    emits: ['upload'],
    data: (): Data => ({
        uploadQueue: new Queue({ concurrency: MAX_CONCURRENT_UPLOADS }),
        uploads: [],
    }),
    beforeDestroy() {
        // - Vide la queue courante.
        this.uploadQueue.clear();

        // - Annule les envois en cours...
        this.uploads.forEach((upload: Upload) => {
            if (upload.isFinished || upload.isCancelled) {
                return;
            }
            upload.cancel();
        });
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleAddFiles(files: FileList) {
            const uploads: Upload[] = Array.from(files).map((file: File) => {
                const abortController = new AbortController();
                const error = getFileError(file);
                const hasError = error !== null;

                const upload: Upload = {
                    uid: uniqueId(),
                    file,
                    error,
                    signal: abortController.signal,
                    isStarted: false,
                    isFinished: hasError,
                    isCancelled: false,
                    cancel: () => {},
                    progress: 0,
                };

                upload.cancel = () => {
                    this.$set(file, 'isCancelled', true);
                    abortController.abort();
                };

                return upload;
            });

            // - Ajoute les uploads aux uploads en cours.
            this.uploads.unshift(...uploads);

            // - Upload les fichiers qui doivent l'être.
            const waitingUploads = uploads.filter(({ isFinished }: Upload) => !isFinished);
            waitingUploads.forEach(async (upload: Upload) => {
                try {
                    const newDocument = await this.uploadQueue.add(async (): Promise<Document> => {
                        if (upload.isCancelled) {
                            throw new Error('aborted.');
                        }

                        this.$set(upload, 'isStarted', true);

                        return this.persister(upload.file, upload.signal, (progress: number): void => {
                            this.$set(upload, 'progress', Math.min(100, Math.round(progress)));
                        });
                    });

                    this.$set(upload, 'isFinished', true);
                    this.$emit('upload', newDocument);

                    const handleFinishedUploaded = (): void => {
                        const index = this.uploads.indexOf(upload);
                        if (index === -1) {
                            return;
                        }
                        this.$delete(this.uploads, index);
                    };
                    setTimeout(handleFinishedUploaded, 3000);
                } catch {
                    if (upload.isCancelled) {
                        return;
                    }

                    // TODO: Améliorer la prise en charge des erreurs de validation.
                    this.$set(upload, 'error', FileError.UPLOAD_ERROR);
                }
            });
        },

        handleCancelUpload(uid: Upload['uid']) {
            const upload = this.uploads.find((_upload: Upload) => _upload.uid === uid);
            if (upload === undefined) {
                return;
            }

            if (!upload.isFinished && !upload.isCancelled) {
                upload.cancel();
            }

            this.uploads.splice(this.uploads.indexOf(upload), 1);
        },

        // ------------------------------------------------------
        // -
        // -    API Publique
        // -
        // ------------------------------------------------------

        isUploading(): boolean {
            return this.uploads.some(
                ({ isFinished }: Upload) => !isFinished,
            );
        },
    },
    render() {
        const { uploads, handleAddFiles, handleCancelUpload } = this;
        const isUploading = uploads.length > 0;

        const className = ['FileManagerUploadArea', {
            'FileManagerUploadArea--uploading': isUploading,
        }];

        return (
            <div class={className}>
                <DropZone
                    class="FileManagerUploadArea__drop-zone"
                    onInput={handleAddFiles}
                />
                {uploads.length > 0 && (
                    <ul class="FileManagerUploadArea__uploads">
                        {uploads.map((upload: Upload) => (
                            <li key={upload.uid} class="FileManagerUploadArea__uploads__item">
                                <UploadItem upload={upload} onCancel={handleCancelUpload} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    },
});

export default FileManagerUploadArea;
