import './index.scss';
import cloneDeep from 'lodash/cloneDeep';
import Fragment from '@/components/Fragment';
import Input from '@/themes/default/components/Input';
import Select from '@/themes/default/components/Select';

const DEFAULT_VALUES = Object.freeze({
    name: '',
    type: 'integer',
    unit: null,
    maxLength: null,
    categories: [],
});

// @vue/component
export default {
    name: 'AttributesAddItemForm',
    props: {
        errors: { type: Object, default: null },
    },
    data: () => ({
        data: cloneDeep(DEFAULT_VALUES),
    }),
    computed: {
        categoriesOptions() {
            return this.$store.getters['categories/options'];
        },

        typesOptions() {
            const { $t: __ } = this;

            return [
                { value: 'integer', label: __('page.attributes.type-integer') },
                { value: 'float', label: __('page.attributes.type-float') },
                { value: 'date', label: __('page.attributes.type-date') },
                { value: 'string', label: __('page.attributes.type-string') },
                { value: 'boolean', label: __('page.attributes.type-boolean') },
            ];
        },

        hasMaxLength() {
            const { type } = this.data;
            return type === 'string';
        },

        hasUnit() {
            const { type } = this.data;
            return ['integer', 'float'].includes(type);
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleToggleCategory(categoryId) {
            return () => {
                const { categories } = this.data;

                const foundIndex = categories.indexOf(categoryId);
                if (foundIndex === -1) {
                    categories.push(categoryId);
                    return;
                }
                categories.splice(foundIndex, 1);
            };
        },

        // ------------------------------------------------------
        // -
        // -    Public API
        // -
        // ------------------------------------------------------

        focus() {
            this.$refs.nameInput.focus();
        },

        getValues() {
            const { data: rawData, hasUnit, hasMaxLength } = this;

            const data = cloneDeep(rawData);

            if (!hasMaxLength) {
                delete data.maxLength;
            }

            if (!hasUnit) {
                delete data.unit;
            }

            return data;
        },

        reset() {
            this.data = cloneDeep(DEFAULT_VALUES);
        },
    },
    render() {
        const {
            $t: __,
            data,
            errors: validationErrors,
            categoriesOptions,
            typesOptions,
            hasUnit,
            hasMaxLength,
            handleToggleCategory,
        } = this;

        return (
            <table class="AttributesAddItemForm">
                <tr>
                    <td class="AttributesAddItemForm__name">
                        <Input
                            ref="nameInput"
                            class="AttributesAddItemForm__input"
                            placeholder={__('page.attributes.name')}
                            v-model={data.name}
                        />
                        {validationErrors?.name?.[0] && (
                            <div class="AttributesAddItemForm__error">
                                {validationErrors.name[0]}
                            </div>
                        )}
                    </td>
                    <td class="AttributesAddItemForm__type">
                        <Select
                            placeholder={false}
                            class="AttributesAddItemForm__select"
                            options={typesOptions}
                            v-model={data.type}
                        />
                        {validationErrors?.type && (
                            <ul class="AttributesAddItemForm__error">
                                {validationErrors.type.map((validationError) => (
                                    <li key={validationError}>{validationError}</li>
                                ))}
                            </ul>
                        )}
                    </td>
                    <td class="AttributesAddItemForm__unit">
                        {hasUnit && (
                            <Fragment>
                                <Input
                                    class="AttributesAddItemForm__input"
                                    placeholder={__('page.attributes.unit')}
                                    v-model={data.unit}
                                />
                                {validationErrors?.unit?.[0] && (
                                    <div class="AttributesAddItemForm__error">
                                        {validationErrors.unit[0]}
                                    </div>
                                )}
                            </Fragment>
                        )}
                    </td>
                    <td class="AttributesAddItemForm__max-length">
                        {hasMaxLength && (
                            <Fragment>
                                <Input
                                    type="number"
                                    class="AttributesAddItemForm__input"
                                    placeholder={__('page.attributes.max-length')}
                                    v-model={data.maxLength}
                                />
                                {validationErrors?.max_length?.[0] && (
                                    <div class="AttributesAddItemForm__error">
                                        {validationErrors.max_length[0]}
                                    </div>
                                )}
                            </Fragment>
                        )}
                    </td>
                    <td class="AttributesAddItemForm__categories">
                        {categoriesOptions.map(({ label, value: categoryId }) => {
                            const isSelected = data.categories.includes(categoryId);
                            return (
                                <span
                                    key={categoryId}
                                    onClick={handleToggleCategory(categoryId)}
                                    class={['AttributesAddItemForm__categories__item', {
                                        'AttributesAddItemForm__categories__item--selected': isSelected,
                                    }]}
                                >
                                    {label}
                                </span>
                            );
                        })}
                    </td>
                </tr>
            </table>
        );
    },
};
