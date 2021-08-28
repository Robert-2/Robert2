import Config from '@/globals/config';
import formatBytes from '@/utils/formatBytes';
import hasIncludes from '@/utils/hasIncludes';

// @vue/component
export default {
    name: 'MaterialViewDocumentsItem',
    props: {
        file: { type: [File, Object], required: true },
    },
    computed: {
        fileSize() {
            return formatBytes(this.file.size);
        },

        fileUrl() {
            const { baseUrl } = Config;
            return `${baseUrl}/documents/${this.file.id}/download`;
        },

        iconName() {
            const { type } = this.file;
            if (type === 'application/pdf') {
                return 'fa-file-pdf';
            }
            if (type.startsWith('image/')) {
                return 'fa-file-image';
            }
            if (type.startsWith('video/')) {
                return 'fa-file-video';
            }
            if (type.startsWith('audio/')) {
                return 'fa-file-audio';
            }
            if (type.startsWith('text/')) {
                return 'fa-file-alt';
            }
            if (hasIncludes(type, ['zip', 'octet-stream', 'x-rar', 'x-tar', 'x-7z'])) {
                return 'fa-file-archive';
            }
            if (hasIncludes(type, ['sheet', 'excel'])) {
                return 'fa-file-excel';
            }
            if (hasIncludes(type, ['wordprocessingml.document', 'msword'])) {
                return 'fa-file-word';
            }
            if (hasIncludes(type, ['presentation', 'powerpoint'])) {
                return 'fa-file-powerpoint';
            }
            return 'fa-file';
        },
    },
    methods: {
        handleClickRemove() {
            this.$emit('remove', this.file);
        },
    },
};
