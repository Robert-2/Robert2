import './index.scss';
import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';

type Props = {
    /** Le nom du champ (utilisé dans un attribut `name`). */
    name?: string,

    /** La valeur du champ. */
    value?: string | number,

    /**
     * Dois-t'on donner le focus au champ lorsque le component est monté ?
     * (cette prop. est incompatible avec la prop. `readonly`)
     */
    autofocus: boolean,

    /**
     * Le champ est-il désactivé ?
     * (cette prop. est incompatible avec la prop. `readonly`)
     */
    disabled: boolean,
};

// @vue/component
const Notepad = defineComponent({
    name: 'Notepad',
    inject: {
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: {
            type: String as PropType<Required<Props>['name']>,
            default: undefined,
        },
        value: {
            type: [String, Number] as PropType<Required<Props>['value']>,
            default: undefined,
        },
        autofocus: {
            type: Boolean as PropType<Required<Props>['autofocus']>,
            default: false,
        },
        disabled: {
            type: Boolean as PropType<Required<Props>['disabled']>,
            default: false,
        },
    },
    computed: {
        inheritedDisabled() {
            if (this.disabled !== undefined) {
                return this.disabled;
            }
            return this['input.disabled'].value;
        },
    },
    mounted() {
        if (this.autofocus && !this.disabled) {
            this.$nextTick(() => { this.$refs.inputRef.focus(); });
        }
    },
    methods: {
        handleInput(e: InputEvent) {
            const { value } = e.target as HTMLTextAreaElement;
            this.$emit('input', value);
        },

        handleChange(e: Event) {
            const { value } = e.target as HTMLTextAreaElement;
            this.$emit('change', value);
        },
    },
    render() {
        const {
            name,
            value,
            readOnly,
            inheritedDisabled: disabled,
            handleInput,
            handleChange,
        } = this;

        const className = ['Notepad', {
            'Notepad--disabled': disabled,
        }];

        return (
            <div class={className}>
                <textarea
                    ref="inputRef"
                    class="Notepad__input"
                    name={name}
                    value={value}
                    onInput={handleInput}
                    onChange={handleChange}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            </div>
        );
    },
});

export default Notepad;
