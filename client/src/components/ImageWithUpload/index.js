import './index.scss';
import { ALLOWED_IMAGE_TYPES } from '@/globals/constants';
import Config from '@/globals/config';
import formatBytes from '@/utils/formatBytes';
import Help from '@/components/Help';
import emptyImageSrc from './assets/empty-image.png';

// @vue/component
export default {
    name: 'ImageWithUpload',
    components: { Help },
    props: {
        url: { type: String, default: null },
        name: { type: String, default: null },
        isLoading: { type: Boolean, required: true },
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

            if (size > Config.maxFileUploadSize) {
                this.fileError = this.$t('errors.file-size-exceeded', {
                    max: formatBytes(Config.maxFileUploadSize),
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
