import './index.scss';
import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';

export enum InputType {
    TEXT = 'text',
    EMAIL = 'email',
    TEL = 'tel',
    PASSWORD = 'password',
    NUMBER = 'number',
    SEARCH = 'search',
}

export enum InputAlignment {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right',
}

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
     * Type du champ (e.g. `text`, `email`, etc.).
     * @see {@link InputType} pour les types possibles.
     *
     * @default {@link InputType.TEXT}
     */
    type?: InputType,

    /**
     * Valeur actuelle du champ.
     *
     * Si cette prop. est omise, le component ne sera pas "contrôlé".
     */
    value?: string | number,

    /**
     * Un nombre qui définit la granularité de la valeur lorsque
     * le champ est de type `number`.
     *
     * @default 0.01
     */
    step?: number,

    /**
     * La valeur maximale qui peut être acceptée pour ce champ
     * lorsque le champ est de type `number`.
     *
     * Par défaut, pas de limite.
     */
    max?: number,

    /**
     * La valeur minimale qui peut être acceptée pour ce champ
     * lorsque le champ est de type `number`.
     *
     * Par défaut, pas de limite.
     */
    min?: number,

    /**
     * Permet de spécifier le type d'assistance automatisée
     * attendue par le navigateur.
     *
     * @see https://developer.mozilla.org/fr/docs/Web/HTML/Attributes/autocomplete
     *
     * @default 'off'
     */
    autocomplete?: AutoFill,

    /**
     * Texte ou élément supplémentaire à afficher à côté du champ.
     *
     * Ce contenu est généralement utilisé pour fournir un libellé supplémentaire,
     * une unité de mesure, ou une icône.
     *
     * @example "kg" pour un champ qui accepte des poids.
     */
    addon?: string,

    /**
     * Alignement du texte dans le champ.
     *
     * @see {@link InputAlignment} pour les types possibles.
     *
     * @default {@link InputAlignment.LEFT}
     */
    align?: InputAlignment,

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

/** Un champ de formulaire textuel. */
const Input = defineComponent({
    name: 'Input',
    inject: {
        'input.invalid': { default: { value: false } },
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: {
            type: String as PropType<Props['name']>,
            default: undefined,
        },
        type: {
            type: String as PropType<Required<Props>['type']>,
            default: InputType.TEXT,
            validator: (value: unknown): boolean => (
                typeof value === 'string' &&
                (Object.values(InputType) as string[]).includes(value)
            ),
        },
        value: {
            type: [String, Number] as PropType<Props['value']>,
            default: undefined,
        },
        step: {
            type: Number as PropType<Required<Props>['value']>,
            default: 0.01,
        },
        min: {
            type: Number as PropType<Props['value']>,
            default: undefined,
        },
        max: {
            type: Number as PropType<Props['value']>,
            default: undefined,
        },
        autocomplete: {
            type: String as PropType<Required<Props>['autocomplete']>,
            default: 'off',
        },
        addon: {
            type: String as PropType<Props['addon']>,
            default: undefined,
        },
        align: {
            type: String as PropType<Required<Props>['align']>,
            default: InputAlignment.LEFT,
            validator: (value: unknown): boolean => (
                typeof value === 'string' &&
                (Object.values(InputAlignment) as string[]).includes(value)
            ),
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
    emits: ['change', 'input', 'keyup'],
    data: () => ({
        focused: false,
    }),
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
            const { value } = e.target! as HTMLInputElement;
            if (this.inheritedDisabled) {
                return;
            }
            this.$emit('input', value);
        },

        handleChange(e: InputEvent) {
            const { value } = e.target! as HTMLInputElement;
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

        handleKeyup(e: KeyboardEvent) {
            this.$emit('keyup', e);
        },

        // ------------------------------------------------------
        // -
        // -    Public API
        // -
        // ------------------------------------------------------

        /**
         * Permet de donner le focus à l'input.
         */
        focus() {
            const $input = this.$refs.input as HTMLInputElement | undefined;
            $input?.focus();
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
            align,
            autocomplete,
            placeholder,
            focused,
            inheritedInvalid: invalid,
            inheritedDisabled: disabled,
            handleFocus,
            handleBlur,
            handleInput,
            handleChange,
            handleKeyup,
        } = this;

        const className = ['Input', {
            'Input--disabled': disabled,
            'Input--focused': focused,
            'Input--invalid': invalid,
            'Input--with-addon': !!addon,
            'Input--align-center': align === InputAlignment.CENTER,
            'Input--align-right': align === InputAlignment.RIGHT,
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
                        onKeyup={handleKeyup}
                    />
                </div>
                {addon && <div class="Input__addon">{addon}</div>}
            </div>
        );
    },
});

export default Input;
