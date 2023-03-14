import './index.scss';
import config from '@/globals/config';
import formatBytes from '@/utils/formatBytes';
import hasIncludes from '@/utils/hasIncludes';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';

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
            const { id } = this.file;

            return id
                ? `${config.baseUrl}/documents/${id}/download`
                // - L'absence d'ID signifie que `this.file` est bien du type `File`
                : URL.createObjectURL(this.file);
        },

        iconName() {
            const { type } = this.file;
            if (type === 'application/pdf') {
                return 'file-pdf';
            }
            if (type.startsWith('image/')) {
                return 'file-image';
            }
            if (type.startsWith('video/')) {
                return 'file-video';
            }
            if (type.startsWith('audio/')) {
                return 'file-audio';
            }
            if (type.startsWith('text/')) {
                return 'file-alt';
            }
            if (hasIncludes(type, ['zip', 'octet-stream', 'x-rar', 'x-tar', 'x-7z'])) {
                return 'file-archive';
            }
            if (hasIncludes(type, ['sheet', 'excel'])) {
                return 'file-excel';
            }
            if (hasIncludes(type, ['wordprocessingml.document', 'msword'])) {
                return 'file-word';
            }
            if (hasIncludes(type, ['presentation', 'powerpoint'])) {
                return 'file-powerpoint';
            }
            return 'file';
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleClickRemove() {
            this.$emit('remove', this.file);
        },
    },
    render() {
        const { $t: __, file: { name }, fileUrl, iconName, fileSize, handleClickRemove } = this;

        return (
            <li class="MaterialViewDocumentsItem">
                <a
                    href={fileUrl}
                    class="MaterialViewDocumentsItem__link"
                    v-tooltip={__('page.material-view.documents.click-to-open')}
                    download={name}
                >
                    <Icon class="MaterialViewDocumentsItem__icon" name={iconName} />
                    {name}
                </a>
                <div class="MaterialViewDocumentsItem__size">
                    {fileSize}
                </div>
                <div class="MaterialViewDocumentsItem__actions">
                    <Button type="trash" onClick={handleClickRemove} />
                </div>
            </li>
        );
    },
};
