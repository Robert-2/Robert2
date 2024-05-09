import './index.scss';
import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';

type Props = {
    /**
     * Le nom du champ (attribut `[name]`).
     *
     * Ceci permettra notamment de récupérer la valeur du champ dans
     * le jeu de données d'un formulaire parent lors de la soumission
     * (`submit`) de celui-ci.
     */
    name?: string,

    /**
     * Valeur actuelle du champ.
     *
     * Si cette prop. est omise, le component ne sera pas "contrôlé".
     */
    value?: string | number,

    /**
     * Dois-t'on donner le focus au champ lorsque le component est monté ?
     * (cette prop. est incompatible avec la prop. `readonly`)
     */
    autofocus?: boolean,

    /**
     * Le champ est-il désactivé ?
     * (cette prop. est incompatible avec la prop. `readonly`)
     */
    disabled?: boolean,
};

// @vue/component
const Notepad = defineComponent({
    name: 'Notepad',
    inject: {
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: {
            type: String as PropType<Props['name']>,
            default: undefined,
        },
        value: {
            type: [String, Number] as PropType<Props['value']>,
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
    emits: ['input', 'change'],
    computed: {
        inheritedDisabled(): boolean {
            if (this.disabled !== undefined) {
                return this.disabled;
            }

            // @ts-expect-error -- Normalement fixé lors du passage à Vue 3 (et son meilleur typage).
            // @see https://github.com/vuejs/core/pull/6804
            return this['input.disabled'].value;
        },
    },
    mounted() {
        if (this.autofocus && !this.disabled) {
            this.$nextTick(() => {
                const $input = this.$refs.input as HTMLTextAreaElement | undefined;
                $input?.focus();
            });
        }
    },
    methods: {
        handleInput(e: InputEvent) {
            const { value } = e.target as HTMLTextAreaElement;
            if (this.inheritedDisabled) {
                return;
            }
            this.$emit('input', value);
        },

        handleChange(e: Event) {
            const { value } = e.target as HTMLTextAreaElement;
            if (this.inheritedDisabled) {
                return;
            }
            this.$emit('change', value);
        },
    },
    render() {
        const {
            name,
            value,
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
                    ref="input"
                    class="Notepad__input"
                    name={name}
                    value={value}
                    onInput={handleInput}
                    onChange={handleChange}
                    disabled={disabled}
                />
            </div>
        );
    },
});

export default Notepad;
