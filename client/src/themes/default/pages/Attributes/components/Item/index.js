import './index.scss';
import Fragment from '@/themes/default/components/Fragment';
import { confirm } from '@/utils/alert';
import apiAttributes from '@/stores/api/attributes';
import Input from '@/themes/default/components/Input';
import Button from '@/themes/default/components/Button';

// @vue/component
export default {
    name: 'AttributesItem',
    props: {
        attribute: { type: Object, required: true },
    },
    data() {
        return {
            isSaving: false,
            isEditing: false,
            isDeleting: false,
            isDeleted: false,
            validationErrors: null,
            newName: null,
        };
    },
    computed: {
        formattedMaxLength() {
            const { $t: __, attribute } = this;

            if (attribute.maxLength != null) {
                return attribute.maxLength;
            }

            return attribute.type === 'string'
                ? __('page.attributes.no-limit')
                : '';
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSave(e) {
            e.preventDefault();

            this.save();
        },

        handleDelete() {
            this.delete();
        },

        handleStartEditing() {
            this.newName = this.attribute.name;
            this.isEditing = true;
        },

        handleCancelEditing() {
            if (this.isSaving) {
                return;
            }

            this.isEditing = false;
            this.newName = null;
            this.validationErrors = null;
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async save() {
            if (this.isDeleting || this.isDeleted || this.isSaving) {
                return;
            }

            const { $t: __, attribute: { id } } = this;

            this.isSaving = true;
            this.validationErrors = null;

            try {
                const attribute = await apiAttributes.update(id, { name: this.newName });

                this.newName = null;
                this.isEditing = false;

                this.$emit('updated', attribute);
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.validationErrors = { ...details };
                } else {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                }
            } finally {
                this.isSaving = false;
            }
        },

        async delete() {
            if (this.isDeleting || this.isDeleted) {
                return;
            }

            const { $t: __, attribute } = this;

            // eslint-disable-next-line no-restricted-syntax
            for (const index of [1, 2]) {
                // eslint-disable-next-line no-await-in-loop
                const { value: isConfirmed } = await confirm({
                    type: 'danger',
                    text: __(`page.attributes.confirm-permanently-delete.${index}`),
                    confirmButtonText: __('yes-permanently-delete'),
                });
                if (!isConfirmed) {
                    return;
                }
            }

            this.isDeleting = true;
            try {
                await apiAttributes.remove(attribute.id);

                this.isDeleted = true;
                this.$emit('deleted', attribute);
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isDeleting = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            isDeleted,
            isSaving,
            isEditing,
            isDeleting,
            handleSave,
            handleDelete,
            handleStartEditing,
            handleCancelEditing,
            validationErrors,
            formattedMaxLength,
            attribute: {
                name,
                type,
                unit,
                categories,
            },
        } = this;

        if (isDeleted || isDeleting) {
            return null;
        }

        const renderName = () => {
            if (isEditing) {
                return (
                    <form class="AttributesItem__name-edit" onSubmit={handleSave}>
                        <div class="AttributesItem__name-edit__form">
                            <Input
                                class="AttributesItem__name-edit__form__input"
                                disabled={isSaving}
                                v-model={this.newName}
                            />
                            <div class="AttributesItem__name-edit__form__actions">
                                <Button
                                    icon="ban"
                                    disabled={isSaving}
                                    onClick={handleCancelEditing}
                                />
                                <Button
                                    icon="check"
                                    type="primary"
                                    loading={isSaving}
                                    htmlType="submit"
                                />
                            </div>
                        </div>
                        {validationErrors?.name?.[0] && (
                            <p class="AttributesItem__name-edit__error">
                                {validationErrors.name[0]}
                            </p>
                        )}
                    </form>
                );
            }

            return (
                <div class="AttributesItem__name">
                    <span class="AttributesItem__name__text">{name}</span>
                    {!isDeleting && (
                        <Button
                            icon="pen"
                            type="success"
                            class="AttributesItem__name__edit-button"
                            onClick={handleStartEditing}
                        />
                    )}
                </div>
            );
        };

        const renderCategories = () => (
            categories.length > 0
                ? categories.map(({ name: _name }) => _name).join(', ')
                : <Fragment>{__('all-categories')} ({__('not-limited')})</Fragment>
        );

        return (
            <tr class="AttributesItem">
                <td class="AttributesItem__cell AttributesItem__cell--name">
                    {renderName()}
                </td>
                <td class="AttributesItem__cell AttributesItem__cell--type">
                    {__(`page.attributes.type-${type}`)}
                </td>
                <td class="AttributesItem__cell AttributesItem__cell--unit">
                    {unit}
                </td>
                <td class="AttributesItem__cell AttributesItem__cell--max-length">
                    {formattedMaxLength}
                </td>
                <td
                    class={['AttributesItem__cell', 'AttributesItem__cell--categories', {
                        'AttributesItem__cell--empty': categories.length === 0,
                    }]}
                >
                    {renderCategories()}
                </td>
                <td class="AttributesItem__cell AttributesItem__cell--actions">
                    {!isEditing && (
                        <Button
                            icon="trash"
                            type="danger"
                            onClick={handleDelete}
                            class={[
                                'AttributesItem__delete-button',
                                { 'AttributesItem__delete-button--visible': isDeleting },
                            ]}
                        />
                    )}
                </td>
            </tr>
        );
    },
};
