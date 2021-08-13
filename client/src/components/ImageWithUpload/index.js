import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/config/constants';
import formatBytes from '@/utils/formatBytes';
import Help from '@/components/Help/Help.vue';
import emptyImageSrc from './assets/empty-image.png';

export default {
    name: 'ImageWithUpload',
    components: { Help },
    props: {
        url: String,
        name: String,
        isLoading: Boolean,
        error: null,
    },
    data() {
        return {
            fileError: null,
            newPicture: null,
            deletedPicture: false,
        };
    },
    computed: {
        imageSrc() {
            if (this.newPicture) {
                return URL.createObjectURL(this.newPicture);
            }
            return this.url || emptyImageSrc;
        },
    },
    methods: {
        openFilesBrowser() {
            const fileInput = this.$refs.chooseFilesButton;
            fileInput.click();
        },

        addFile(event) {
            event.preventDefault();
            this.fileError = null;

            const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
            if (!files || files.length === 0) {
                return;
            }

            const file = files[0];
            const { type, size } = file;

            if (!ALLOWED_IMAGE_TYPES.includes(type)) {
                this.fileError = this.$t('errors.file-type-not-allowed', { type });
                return;
            }

            if (size > MAX_FILE_SIZE) {
                this.fileError = this.$t('errors.file-size-exceeded', {
                    max: formatBytes(MAX_FILE_SIZE),
                });
                return;
            }

            this.newPicture = file;
            this.$emit('changePicture', this.newPicture);
        },

        cancelChangePicture() {
            this.newPicture = null;
            this.deletedPicture = false;
            this.$emit('resetPicture');
        },

        removePicture() {
            this.fileError = null;
            this.newPicture = null;
            this.deletedPicture = true;
            this.$emit('changePicture', null);
        },
    },
};
