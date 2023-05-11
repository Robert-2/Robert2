import './index.scss';
import { defineComponent } from '@vue/composition-api';

// @vue/component
const Textarea = defineComponent({
    name: 'Textarea',
    inject: {
        'input.invalid': { default: { value: false } },
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: { type: String, default: null },
        value: { type: [String, Number], default: undefined },
        rows: { type: Number, default: 3 },
        placeholder: { type: String, default: undefined },
        disabled: { type: Boolean, default: undefined },
        invalid: { type: Boolean, default: undefined },
    },
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
    },
    render() {
        const {
            name,
            rows,
            value,
            inheritedInvalid: invalid,
            inheritedDisabled: disabled,
            placeholder,
            handleInput,
            handleChange,
        } = this;

        const className = ['Textarea', {
            'Textarea--invalid': invalid,
        }];

        return (
            <textarea
                class={className}
                name={name}
                value={value}
                rows={rows}
                disabled={disabled}
                placeholder={placeholder}
                onInput={handleInput}
                onChange={handleChange}
            />
        );
    },
});

export default Textarea;
