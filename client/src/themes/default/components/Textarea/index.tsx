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
     * Le nombre de lignes qui doivent être affichées dans la zone de rédaction.
     *
     * @default 3
     */
    rows?: number,

    /**
     * L'éventuel texte affiché en filigrane dans le
     * champ quand celui-ci est vide.
     */
    placeholder?: string,

    /** Le champ est-il désactivé ? */
    disabled?: boolean,

    /** Le champ doit-il être marqué comme invalide ? */
    invalid?: boolean,
};

/** Un champ permettant d'éditer du texte sur plusieurs lignes (= `<textarea>`). */
const Textarea = defineComponent({
    name: 'Textarea',
    inject: {
        'input.invalid': { default: { value: false } },
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
        rows: {
            type: Number as PropType<Required<Props>['rows']>,
            default: 3,
        },
        placeholder: {
            type: String as PropType<Props['placeholder']>,
            default: undefined,
        },
        disabled: {
            type: Boolean as PropType<Props['disabled']>,
            default: undefined,
        },
        invalid: {
            type: Boolean as PropType<Props['invalid']>,
            default: undefined,
        },
    },
    emits: ['input', 'change'],
    computed: {
        inheritedInvalid(): boolean {
            if (this.invalid !== undefined) {
                return this.invalid;
            }

            // @ts-expect-error -- Normalement fixé lors du passage à Vue 3 (et son meilleur typage).
            // @see https://github.com/vuejs/core/pull/6804
            return this['input.invalid'].value;
        },

        inheritedDisabled(): boolean {
            if (this.disabled !== undefined) {
                return this.disabled;
            }

            // @ts-expect-error -- Normalement fixé lors du passage à Vue 3 (et son meilleur typage).
            // @see https://github.com/vuejs/core/pull/6804
            return this['input.disabled'].value;
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // -
        // -    API Publique
        // -
        // ------------------------------------------------------

        /**
         * Permet de donner le focus au textarea.
         */
        focus() {
            const $textarea = this.$refs.textarea as HTMLTextAreaElement | undefined;
            $textarea?.focus();
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
                ref="textarea"
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
