import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { AUTHORIZED_FILE_TYPES } from '@/globals/constants';
import config from '@/globals/config';
import formatBytes from '@/utils/formatBytes';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';

type Data = {
    isDragging: boolean,
};

// @vue/component
const FileManagerDropZone = defineComponent({
    name: 'FileManagerDropZone',
    emits: ['input', 'dragStart', 'dragStop'],
    data: (): Data => ({
        isDragging: false,
    }),
    computed: {
        maxSize: () => formatBytes(config.maxFileUploadSize),
    },
    mounted() {
        // - Binding.
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
        this.handleDrop = this.handleDrop.bind(this);

        // - Global listeners.
        document.addEventListener('dragover', this.handleDragOver);
        document.addEventListener('dragleave', this.handleDragLeave);
        document.addEventListener('drop', this.handleDrop);
    },
    beforeDestroy() {
        document.removeEventListener('dragover', this.handleDragOver);
        document.removeEventListener('dragleave', this.handleDragLeave);
        document.removeEventListener('drop', this.handleDrop);
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleDragOver(e: DragEvent) {
            e.preventDefault();

            this.isDragging = true;
            this.$emit('dragStart');
        },

        handleDragLeave(e: DragEvent) {
            e.preventDefault();

            this.isDragging = false;
            this.$emit('dragStop');
        },

        handleDrop(e: DragEvent) {
            e.preventDefault();

            this.isDragging = false;
            this.$emit('dragStop');

            const files = e.dataTransfer?.files;
            if (!files || files.length === 0) {
                return;
            }

            this.$emit('input', files);
        },

        handleClickOpenFileBrowser(e: Event) {
            e.stopPropagation();

            this.$refs.inputFileRef.click();
        },

        handleAddFiles(e: Event) {
            e.preventDefault();

            this.isDragging = false;
            this.$emit('dragStop');

            const files = (e.target as HTMLInputElement)?.files;
            if (!files || files.length === 0) {
                return;
            }

            this.$emit('input', files);
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
            maxSize,
            isDragging,
            handleAddFiles,
            handleClickOpenFileBrowser,
        } = this;

        const className = ['FileManagerDropZone', {
            'FileManagerDropZone--dragging': isDragging,
        }];

        return (
            <div
                class={className}
                onClick={handleClickOpenFileBrowser}
            >
                <div class="FileManagerDropZone__content">
                    <Icon name="cloud-upload-alt" class="FileManagerDropZone__icon" />
                    <p class="FileManagerDropZone__instruction">
                        {__('drag-and-drop-files-here')}<br />
                        <span class="FileManagerDropZone__instruction__sub-line">
                            {__('max-size', { size: maxSize })}
                        </span>
                    </p>
                    <Button
                        type="primary"
                        class="FileManagerDropZone__choose-files"
                        onClick={handleClickOpenFileBrowser}
                    >
                        {__('choose-files')}
                    </Button>
                </div>
                <input
                    multiple
                    type="file"
                    ref="inputFileRef"
                    accept={AUTHORIZED_FILE_TYPES.join(',')}
                    class="FileManagerDropZone__file-input"
                    onChange={handleAddFiles}
                />
            </div>
        );
    },
});

export default FileManagerDropZone;
