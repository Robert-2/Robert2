import './index.scss';
import VueSelect from 'vue-select';
import Fragment from '@/components/Fragment';
import icons from './icons';

// @vue/component
export default {
    name: 'Select',
    inject: {
        'input.invalid': { default: { value: false } },
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: { type: String, default: null },
        disabled: { type: Boolean, default: undefined },
        invalid: { type: Boolean, default: undefined },
        placeholder: { type: [Boolean, String], default: true },
        autocomplete: { type: String, default: 'off' },
        highlight: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        value: {
            required: true,
            validator: (value) => {
                if (value === null) {
                    return true;
                }

                const validateValue = (_value) => (
                    ['number', 'string'].includes(typeof _value)
                );

                // - Mode multiple.
                if (Array.isArray(value)) {
                    return value.every((_value) => validateValue(_value));
                }
                return validateValue(value);
            },
        },
        options: {
            required: true,
            validator: (options) => {
                if (!Array.isArray(options)) {
                    return false;
                }

                return options.every((option) => {
                    if (typeof option !== 'object' || option === null) {
                        return ['string', 'number'].includes(typeof option);
                    }

                    return ['label', 'value'].every((field) => (
                        ['string', 'number'].includes(typeof option[field])
                    ));
                });
            },
        },
    },
    computed: {
        formattedPlaceholder() {
            const { $t: __, placeholder } = this;

            if (placeholder === false) {
                return null;
            }

            return placeholder === true
                ? __('please-choose')
                : placeholder;
        },

        inheritedInvalid() {
            if (this.invalid !== undefined) {
                return this.invalid;
            }
            return this['input.invalid'].value;
        },

        inheritedDisabled() {
            if (this.disabled !== undefined) {
                return this.disabled;
            }
            return this['input.disabled'].value;
        },

        selected() {
            const { options, value } = this;

            if (value === null) {
                return null;
            }

            if (this.multiple) {
                return options.filter((option) => {
                    option = typeof option === 'object' && option !== null
                        ? option.value
                        : option;

                    const isMatching = (_value) => (
                        option.toString() === _value.toString()
                    );

                    return Array.isArray(value)
                        ? value.some((item) => isMatching(item))
                        : isMatching(value);
                });
            }

            return options.find((option) => {
                option = typeof option === 'object' && option !== null
                    ? option.value
                    : option;

                return value.toString() === option.toString();
            }) ?? null;
        },

        clearable() {
            return this.placeholder !== false;
        },
    },
    methods: {
        handleInput(selected) {
            if (this.inheritedDisabled) {
                return;
            }

            if (this.multiple) {
                if (selected === null) {
                    selected = [];
                }

                if (!Array.isArray(selected)) {
                    selected = [selected];
                }

                selected = selected.map((item) => (
                    typeof selected === 'object' ? item.value : item
                ));
            } else if (selected === null) {
                selected = '';
            } else if (typeof selected === 'object') {
                selected = selected.value;
            }

            this.$emit('input', selected);
            this.$emit('change', selected);
        },
    },
    render() {
        const {
            $t: __,
            name,
            value,
            options,
            selected,
            multiple,
            inheritedInvalid: invalid,
            inheritedDisabled: disabled,
            highlight,
            clearable,
            autocomplete,
            formattedPlaceholder,
            handleInput,
        } = this;

        const renderHiddenInput = () => {
            if (!name || disabled) {
                return null;
            }

            if (multiple && Array.isArray(value)) {
                return (
                    <Fragment>
                        <input type="hidden" name={name} value="" />
                        {value.map((_value) => (
                            <input
                                key={_value}
                                type="hidden"
                                name={`${name}[]`}
                                value={_value}
                            />
                        ))}
                    </Fragment>
                );
            }

            return <input type="hidden" name={name} value={value ?? ''} />;
        };

        const className = ['Select', {
            'Select--invalid': invalid,
            'Select--highlight': highlight,
        }];

        return (
            <div class={className}>
                <VueSelect
                    class="Select__input"
                    disabled={disabled}
                    clearable={clearable}
                    placeholder={formattedPlaceholder}
                    autocomplete={autocomplete}
                    options={options}
                    value={selected}
                    onInput={handleInput}
                    components={icons}
                    multiple={multiple}
                    scopedSlots={{
                        'no-options': ({ searching }) => {
                            if (!searching || options.length === 0) {
                                return __('select-no-options');
                            }
                            return __('select-no-matching-result');
                        },
                    }}
                />
                {renderHiddenInput()}
            </div>
        );
    },
};
