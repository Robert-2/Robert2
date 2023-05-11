import './index.scss';
import { confirm } from '@/utils/alert';
import apiAttributes from '@/stores/api/attributes';
import Button from '@/themes/default/components/Button';

// @vue/component
export default {
    name: 'AttributesItem',
    props: {
        attribute: { type: Object, required: true },
    },
    data() {
        return {
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

            if (![undefined, null].includes(attribute.maxLength)) {
                return attribute.maxLength;
            }

            return attribute.type === 'string'
                ? __('page.attributes.no-limit')
                : '';
        },

        formattedTotalisable() {
            const { $t: __, attribute } = this;

            if (!['integer', 'float'].includes(attribute.type)) {
                return null;
            }

            return attribute.isTotalisable ? __('yes') : __('no');
        },

        formattedCategories() {
            const { $t: __, attribute: { categories } } = this;

            return categories.length > 0
                ? categories.map(({ name: _name }) => _name).join(', ')
                : __('page.attributes.all-categories-not-limited');
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleDelete() {
            if (this.isDeleting || this.isDeleted) {
                return;
            }

            const { $t: __, attribute } = this;

            // eslint-disable-next-line no-restricted-syntax
            for (const index of [1, 2]) {
                // eslint-disable-next-line no-await-in-loop
                const isConfirmed = await confirm({
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
            attribute: {
                id,
                name,
                type,
                unit,
                categories,
            },
            formattedTotalisable,
            formattedMaxLength,
            formattedCategories,
            handleDelete,
            isDeleting,
        } = this;

        if (isDeleted) {
            return null;
        }

        return (
            <tr class="AttributesItem">
                <td class="AttributesItem__cell AttributesItem__cell--name">
                    {name}
                </td>
                <td class="AttributesItem__cell AttributesItem__cell--type">
                    {__(`page.attributes.type-${type}`)}
                </td>
                <td class="AttributesItem__cell AttributesItem__cell--unit">
                    {unit}
                </td>
                <td class="AttributesItem__cell AttributesItem__cell--is-totalisable">
                    {formattedTotalisable}
                </td>
                <td class="AttributesItem__cell AttributesItem__cell--max-length">
                    {formattedMaxLength}
                </td>
                <td
                    class={['AttributesItem__cell', 'AttributesItem__cell--categories', {
                        'AttributesItem__cell--empty': categories.length === 0,
                    }]}
                >
                    {formattedCategories}
                </td>
                <td class="AttributesItem__cell AttributesItem__cell--actions">
                    <Button
                        type="edit"
                        to={{ name: 'edit-attribute', params: { id } }}
                    />
                    <Button
                        type="trash"
                        onClick={handleDelete}
                        loading={isDeleting}
                    />
                </td>
            </tr>
        );
    },
};
