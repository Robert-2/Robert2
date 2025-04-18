import './index.scss';
import axios from 'axios';
import { defineComponent } from '@vue/composition-api';
import { ApiErrorCode } from '@/stores/api/@codes';
import apiTags from '@/stores/api/tags';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';

import type { Tag, TagEdit } from '@/stores/api/tags';
import type { PropType } from '@vue/composition-api';

type Props = {
    /**
     * Le tag à modifier.
     * Si non fourni, on considérera que c'est un ajout.
     */
    tag?: Tag,
};

type Data = {
    name: TagEdit['name'],
    isSaving: boolean,
    validationErrors: Record<string, string> | null,
};

/** Modale permettant de créer ou modifier un tag. */
const EditTag = defineComponent({
    name: 'EditTag',
    provide: {
        verticalForm: true,
    },
    modal: {
        width: 600,
        draggable: true,
        clickToClose: false,
    },
    props: {
        tag: {
            type: Object as PropType<Props['tag']>,
            default: undefined,
        },
    },
    emits: ['saved', 'close'],
    data(): Data {
        return {
            name: this.tag?.name ?? '',
            isSaving: false,
            validationErrors: null,
        };
    },
    computed: {
        title(): string {
            return this.tag === undefined
                ? this.__('title-create')
                : this.__('title-edit');
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e: SubmitEvent) {
            e?.preventDefault();

            this.save();
        },

        handleSave() {
            this.save();
        },

        handleClose() {
            this.$emit('close', undefined);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async save() {
            if (this.isSaving) {
                return;
            }
            this.isSaving = true;
            const { __, tag, name } = this;

            try {
                const updatedTag = tag === undefined
                    ? await apiTags.create({ name })
                    : await apiTags.update(tag.id, { name });

                this.$store.dispatch('tags/refresh');

                this.$emit('saved');
                this.$emit('close', updatedTag);
            } catch (error) {
                this.isSaving = false;

                if (axios.isAxiosError(error)) {
                    const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        this.validationErrors = { ...details };
                        return;
                    }
                }
                this.$toasted.error(__('global.errors.unexpected-while-saving'));
            }
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `modal.edit-tag.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            title,
            isSaving,
            validationErrors,
            handleSubmit,
            handleSave,
            handleClose,
        } = this;

        return (
            <div class="EditTag">
                <header class="EditTag__header">
                    <h2 class="EditTag__header__title">{title}</h2>
                    <Button
                        type="close"
                        class="EditTag__header__close-button"
                        onClick={handleClose}
                    />
                </header>
                <div class="EditTag__body">
                    <form class="EditTag__form" onSubmit={handleSubmit}>
                        <FormField
                            type="text"
                            label={__('tag-name')}
                            class="EditTag__form__input-name"
                            v-model={this.name}
                            error={validationErrors?.name}
                            required
                        />
                    </form>
                </div>
                <div class="EditTag__footer">
                    <Button type="primary" onClick={handleSave} loading={isSaving}>
                        {isSaving ? __('global.saving') : __('global.save')}
                    </Button>
                    <Button onClick={handleClose}>
                        {__('global.cancel')}
                    </Button>
                </div>
            </div>
        );
    },
});

export default EditTag;
