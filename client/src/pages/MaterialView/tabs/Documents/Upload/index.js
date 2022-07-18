import './index.scss';
import config from '@/globals/config';
import getFileError from '@/utils/getFileError';
import formatBytes from '@/utils/formatBytes';
import apiMaterials from '@/stores/api/materials';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Loading from '@/components/Loading';
import Progressbar from '@/components/Progressbar';
import DocumentItem from '../Item';

// @vue/component
export default {
    name: 'MaterialViewDocumentsUpload',
    props: {
        materialId: { type: Number, required: true },
    },
    data() {
        return {
            isDragging: false,
            isLoading: false,
            files: [],
            fileErrors: [],
            uploadProgress: 0,
        };
    },
    computed: {
        maxSize: () => formatBytes(config.maxFileUploadSize),
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleClickOpenFileBrowser() {
            const fileInput = this.$refs.chooseFilesButton;
            fileInput.click();
        },

        handleDragover(e) {
            e.preventDefault();
            this.isDragging = true;
        },

        handleDragleave(e) {
            e.preventDefault();
            this.isDragging = false;
        },

        handleAddFiles(event) {
            event.preventDefault();
            this.isDragging = false;
            this.fileErrors = [];

            const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
            if (!files || files.length === 0) {
                return;
            }

            const newFiles = [...files].filter(this.checkFile);

            this.files = [...this.files, ...newFiles].sort(
                ({ name: name1 }, { name: name2 }) => name1.localeCompare(name2),
            );
        },

        handleRemoveFile(file) {
            this.fileErrors = [];
            this.files = this.files.filter(({ name }) => name !== file.name);
        },

        async handleUploadFiles() {
            this.fileErrors = [];
            this.isLoading = true;
            this.uploadProgress = 0;

            const onProgress = (percent) => {
                this.uploadProgress = percent;
            };

            try {
                await apiMaterials.attachDocuments(this.materialId, this.files, onProgress);
                this.files = [];
                this.$emit('fileUploaded');
            } catch {
                const { $t: __ } = this;
                this.$toasted.error(__('errors.unexpected-while-uploading'));
            } finally {
                this.isLoading = false;
                this.uploadProgress = 0;
            }
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        checkFile(file) {
            const fileError = getFileError(file, this.files);
            if (!fileError) {
                return true;
            }

            const { type, name } = file;
            const { $t: __ } = this;

            let message = '';
            switch (fileError) {
                case 'type-not-allowed':
                    message = __('errors.file-type-not-allowed', { type });
                    break;
                case 'size-exceeded':
                    message = __('errors.file-size-exceeded', {
                        max: formatBytes(config.maxFileUploadSize),
                    });
                    break;
                case 'already-exists':
                    message = __('errors.file-already-exists');
                    break;
                default:
                    return false;
            }

            this.fileErrors.push({ fileName: name, message });
            return false;
        },
    },
    render() {
        const {
            $t: __,
            isDragging,
            isLoading,
            maxSize,
            files,
            fileErrors,
            uploadProgress,
            handleAddFiles,
            handleDragover,
            handleDragleave,
            handleClickOpenFileBrowser,
            handleRemoveFile,
            handleUploadFiles,
        } = this;

        const className = {
            'MaterialViewDocumentsUpload': true,
            'MaterialViewDocumentsUpload--drag-over': isDragging,
        };

        return (
            <section
                class={className}
                onDrop={handleAddFiles}
                onDragover={handleDragover}
                onDragleave={handleDragleave}
            >
                <h2 class="MaterialViewDocumentsUpload__title">
                    {__('page.material-view.documents.drag-and-drop-files-here')}
                </h2>
                <p>{__('page.material-view.documents.max-size', { size: maxSize })}</p>
                <Button
                    type="primary"
                    class="MaterialViewDocumentsUpload__choose-files"
                    onClick={handleClickOpenFileBrowser}
                >
                    {__('page.material-view.documents.choose-files')}
                </Button>
                <ul class="MaterialViewDocumentsUpload__send-list">
                    {files.map((file) => (
                        <DocumentItem
                            key={file.name}
                            file={file}
                            onRemove={handleRemoveFile}
                        />
                    ))}
                </ul>
                {fileErrors.length > 0 && (
                    <ul class="MaterialViewDocumentsUpload__file-errors">
                        {fileErrors.map((fileError) => (
                            <li
                                key={fileError.fileName}
                                class="MaterialViewDocumentsUpload__file-errors__item"
                            >
                                <Icon name="exclamation-triangle" />{' '}
                                {fileError.fileName} &rarr; {fileError.message}
                            </li>
                        ))}
                    </ul>
                )}
                <div class="MaterialViewDocumentsUpload__actions">
                    {files.length > 0 && (
                        <Button
                            type="success"
                            icon="upload"
                            class="MaterialViewDocumentsUpload__actions__send-files"
                            disabled={isLoading}
                            onClick={handleUploadFiles}
                        >
                            {__('page.material-view.documents.send-files', { count: files.length }, files.length)}
                        </Button>
                    )}
                    <input
                        type="file"
                        multiple
                        onChange={handleAddFiles}
                        ref="chooseFilesButton"
                        class="MaterialViewDocumentsUpload__actions__file-input"
                    />
                    {isLoading && <Loading />}
                </div>
                {uploadProgress > 0 && (
                    <Progressbar percent={uploadProgress} />
                )}
            </section>
        );
    },
};
