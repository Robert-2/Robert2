import './index.scss';

export const TYPES = ['text', 'email', 'tel', 'password', 'number'];

// @vue/component
export default {
    name: 'Input',
    inject: {
        'input.invalid': { default: { value: false } },
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: { type: String, default: null },
        type: {
            validator: (value) => TYPES.includes(value),
            default: 'text',
        },
        value: { type: [String, Number], default: undefined },
        step: { type: Number, default: 0.01 },
        min: { type: Number, default: null },
        max: { type: Number, default: null },
        autocomplete: { type: String, default: 'off' },
        placeholder: { type: String, default: undefined },
        addon: { type: String, default: null },
        disabled: { type: Boolean, default: undefined },
        invalid: { type: Boolean, default: undefined },
    },
    data: () => ({
        focused: false,
    }),
    computed: {
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
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleInput(e) {
            const { value } = e.target;

            if (this.inheritedDisabled) {
                return;
            }

            this.$emit('input', value);
        },

        handleChange(e) {
            const { value } = e.target;

            if (this.inheritedDisabled) {
                return;
            }

            this.$emit('change', value);
        },

        handleFocus() {
            this.focused = true;
        },

        handleBlur() {
            this.focused = false;
        },

        // ------------------------------------------------------
        // -
        // -    Public API
        // -
        // ------------------------------------------------------

        focus() {
            this.$refs.input.focus();
        },
    },
    render() {
        const {
            type,
            name,
            value,
            step,
            min,
            max,
            addon,
            autocomplete,
            placeholder,
            focused,
            inheritedInvalid: invalid,
            inheritedDisabled: disabled,
            handleFocus,
            handleBlur,
            handleInput,
            handleChange,
        } = this;

        const className = ['Input', {
            'Input--focused': focused,
            'Input--invalid': invalid,
            'Input--with-addon': !!addon,
        }];

        return (
            <div class={className}>
                <div class="Input__field">
                    <input
                        ref="input"
                        class="Input__input"
                        type={type}
                        step={type === 'number' ? (step || 0.01) : null}
                        min={type === 'number' && (min || min === 0) ? min : null}
                        max={type === 'number' && (max || max === 0) ? max : null}
                        name={name}
                        autocomplete={autocomplete}
                        disabled={disabled}
                        placeholder={placeholder}
                        value={value}
                        onInput={handleInput}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                </div>
                {addon && <div class="Input__addon">{addon}</div>}
            </div>
        );
    },
};
