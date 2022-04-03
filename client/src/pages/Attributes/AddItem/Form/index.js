import './index.scss';
import { Fragment } from 'vue-fragment';

// @vue/component
export default {
    name: 'AttributesAddItemForm',
    props: {
        errors: { type: Object, default: null },
    },
    data() {
        return {
            hasUnit: true,
            hasMaxLength: false,
            categories: [],
        };
    },
    computed: {
        categoriesOptions() {
            return this.$store.getters['categories/options']
                .filter(({ value }) => value !== '');
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Public API
        // -
        // ------------------------------------------------------

        focus() {
            this.$refs.InputName.focus();
        },

        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleTypeChange(e) {
            const { value } = e.currentTarget;

            this.hasUnit = ['integer', 'float'].includes(value);
            this.hasMaxLength = value === 'string';
        },

        handleToggleCategory(categoryId) {
            return () => {
                const foundIndex = this.categories.indexOf(categoryId);
                if (foundIndex === -1) {
                    this.categories.push(categoryId);
                    return;
                }
                this.categories.splice(foundIndex, 1);
            };
        },

        // ------------------------------------------------------
        // -
        // -    Public API
        // -
        // ------------------------------------------------------

        getValues() {
            const { hasUnit, hasMaxLength } = this;
            const { InputName, InputType, InputUnit, InputMaxLength } = this.$refs;

            const data = {
                name: InputName.value,
                type: InputType.value,
                categories: [...this.categories],
            };

            if (hasMaxLength) {
                Object.assign(data, {
                    maxLength: InputMaxLength?.value ?? null,
                });
            }

            if (hasUnit) {
                Object.assign(data, {
                    unit: InputUnit?.value ?? null,
                });
            }

            return data;
        },

        reset() {
            this.$refs.InputName.value = '';
            this.$refs.InputType.value = '';

            if (this.$refs.InputUnit) {
                this.$refs.InputUnit.value = '';
            }

            if (this.$refs.InputMaxLength) {
                this.$refs.InputMaxLength.value = '';
            }
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        isSelected(categoryId) {
            return this.categories.includes(categoryId);
        },
    },
    render() {
        const {
            $t: __,
            errors: validationErrors,
            categoriesOptions,
            hasUnit,
            hasMaxLength,
            handleTypeChange,
            handleToggleCategory,
        } = this;

        return (
            <table class="AttributesAddItemForm">
                <tr>
                    <td class="AttributesAddItemForm__name">
                        <input
                            ref="InputName"
                            type="text"
                            class="AttributesAddItemForm__input"
                            placeholder={__('page-attributes.name')}
                        />
                        {validationErrors?.name?.[0] && (
                            <div class="AttributesAddItemForm__error">
                                {validationErrors.name[0]}
                            </div>
                        )}
                    </td>
                    <td class="AttributesAddItemForm__type">
                        <select
                            ref="InputType"
                            class="AttributesAddItemForm__select"
                            onChange={handleTypeChange}
                        >
                            <option value="integer">{__('page-attributes.type-integer')}</option>
                            <option value="float">{__('page-attributes.type-float')}</option>
                            <option value="date">{__('page-attributes.type-date')}</option>
                            <option value="string">{__('page-attributes.type-string')}</option>
                            <option value="boolean">{__('page-attributes.type-boolean')}</option>
                        </select>
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
                                <input
                                    ref="InputUnit"
                                    type="text"
                                    class="AttributesAddItemForm__input"
                                    placeholder={__('page-attributes.unit')}
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
                                <input
                                    ref="InputMaxLength"
                                    type="number"
                                    class="AttributesAddItemForm__input"
                                    placeholder={__('page-attributes.max-length')}
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
                            const isSelected = this.isSelected(categoryId);
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
