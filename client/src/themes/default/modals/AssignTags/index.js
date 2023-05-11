import './index.scss';
import Select from '@/themes/default/components/Select';
import Button from '@/themes/default/components/Button';

// @vue/component
export default {
    name: 'AssignTags',
    modal: {
        width: 600,
        draggable: true,
        clickToClose: false,
    },
    props: {
        name: { type: String, required: true },
        initialTags: { type: Array, default: () => [] },
        persister: { type: Function, required: true },
    },
    data() {
        return {
            tags: this.initialTags.map(({ id }) => id),
            isSaving: false,
        };
    },
    computed: {
        title() {
            const { $t: __ } = this;

            return __('modal.assign-tags.entity-name-tags', {
                entityName: this.name || '',
            });
        },

        tagsOptions() {
            return this.$store.getters['tags/options'];
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSave() {
            this.save();
        },

        handleClose() {
            this.$emit('close');
        },

        handleRemoveAll() {
            this.tags = [];
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

            const { $t: __, tags } = this;
            this.isSaving = true;

            try {
                await this.persister(tags);

                this.$emit('saved');
                this.$emit('close');
            } catch {
                this.$toasted.error(__('errors.unexpected-while-saving'));
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            title,
            tagsOptions,
            isSaving,
            handleSave,
            handleClose,
            handleRemoveAll,
        } = this;

        return (
            <div class="AssignTags">
                <header class="AssignTags__header">
                    <h2 class="AssignTags__header__title">{title}</h2>
                    <Button
                        type="close"
                        class="AssignTags__header__close-button"
                        onClick={handleClose}
                    />
                </header>
                <div class="AssignTags__body">
                    <p class="AssignTags__help">{__('modal.assign-tags.choose-tags-below')}</p>
                    <div class="AssignTags__form">
                        <Select
                            v-model={this.tags}
                            options={tagsOptions}
                            class="AssignTags__form__select"
                            multiple
                        />
                        <Button
                            type="danger"
                            icon="backspace"
                            tooltip={__('remove-all-tags')}
                            class="AssignTags__form__remove-all"
                            onClick={handleRemoveAll}
                        />
                    </div>
                </div>
                <div class="AssignTags__footer">
                    <Button type="primary" onClick={handleSave} loading={isSaving}>
                        {isSaving ? __('saving') : __('save')}
                    </Button>
                    <Button onClick={handleClose}>
                        {__('cancel')}
                    </Button>
                </div>
            </div>
        );
    },
};
