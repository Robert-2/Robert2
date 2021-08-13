import { AUTHORIZED_FILE_TYPES, MAX_FILE_SIZE } from '@/config/constants';
import formatBytes from '@/utils/formatBytes';
import Help from '@/components/Help/Help.vue';
import Progressbar from '@/components/Progressbar/Progressbar.vue';
import DocumentItem from '../Item/Item.vue';

export default {
    name: 'MaterialViewDocumentsUpload',
    components: { Help, DocumentItem, Progressbar },
    props: {
        materialId: { type: String, required: true },
    },
    data() {
        return {
            error: null,
            fileErrors: [],
            isDragging: false,
            isLoading: false,
            files: [],
            uploadProgress: 0,
        };
    },
    methods: {
        openFilesBrowser() {
            const fileInput = this.$refs.chooseFilesButton;
            fileInput.click();
        },

        handleDragover() {
            this.isDragging = true;
        },

        handleDragleave() {
            this.isDragging = false;
        },

        checkFile(file) {
            const { type, size, name } = file;

            if (!AUTHORIZED_FILE_TYPES.includes(type)) {
                this.fileErrors.push({
                    fileName: name,
                    message: this.$t('errors.file-type-not-allowed', { type }),
                });
                return false;
            }

            if (size > MAX_FILE_SIZE) {
                this.fileErrors.push({
                    fileName: name,
                    message: this.$t('errors.file-size-exceeded', {
                        max: formatBytes(MAX_FILE_SIZE),
                    }),
                });
                return false;
            }

            const fileExists = this.files.some(({ name: existingName }) => existingName === name);
            if (fileExists) {
                this.fileErrors.push({
                    fileName: name,
                    message: this.$t('errors.file-already-exists'),
                });
                return false;
            }

            return true;
        },

        addFiles(event) {
            event.preventDefault();
            this.isDragging = false;
            this.fileErrors = [];
            this.error = null;

            const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
            if (!files || files.length === 0) {
                return;
            }

            const newFiles = [...files].filter(this.checkFile);

            this.files = [...this.files, ...newFiles].sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (nameA < nameB) return -1;
                return nameA > nameB ? 1 : 0;
            });
        },

        removeFile(file) {
            this.fileErrors = [];
            this.files = this.files.filter(({ name }) => name !== file.name);
        },

        uploadFiles() {
            this.fileErrors = [];
            this.error = null;
            this.isLoading = true;
            this.uploadProgress = 0;

            const formData = new FormData();
            this.files.forEach((file, index) => {
                formData.append(`file-${index}`, file);
            });

            const onUploadProgress = (event) => {
                if (!event.lengthComputable) {
                    return;
                }

                const { loaded, total } = event;
                this.uploadProgress = (loaded / total) * 100;
            };

            this.$http.post(`materials/${this.materialId}/documents`, formData, { onUploadProgress })
                .then(() => {
                    this.isLoading = false;
                    this.files = [];
                    this.$emit('uploadSuccess');
                    this.uploadProgress = 0;
                })
                .catch(this.displayError);
        },

        displayError(error) {
            this.error = error;
            this.isLoading = false;
        },
    },
};
