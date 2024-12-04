import './index.scss';
import { defineComponent } from '@vue/composition-api';
import VueSelect from 'vue-select';
import Fragment from '@/components/Fragment';
import icons from './icons';

import type { PropType } from '@vue/composition-api';

export type Option = {
    /** Le libellé qui sera affiché pour cette option. */
    label: string,

    /** La valeur de l'option. */
    value: string | number,
};

type Props = {
    /**
     * Le nom du champ (attribut `[name]`).
     *
     * Ceci permettra notamment de récupérer la valeur du champ dans
     * le jeu de données d'un formulaire parent lors de la soumission
     * (`submit`) de celui-ci.
     */
    name?: string,

    /** Le champ est-il désactivé ? */
    disabled?: boolean,

    /** Le champ doit-il être marqué comme invalide ? */
    invalid?: boolean,

    /**
     * L'éventuel texte affiché en filigrane dans le
     * champ quand celui-ci est vide.
     */
    placeholder?: boolean,

    /**
     * Permet de spécifier le type d'assistance automatisée
     * attendue par le navigateur.
     *
     * @see https://developer.mozilla.org/fr/docs/Web/HTML/Attributes/autocomplete
     *
     * @default 'off'
     */
    autocomplete?: AutoFill,

    /** Le champ doit-il être mis en surbrillance ? */
    highlight?: boolean,

    /** S'agit-il d'un sélecteur à choix multiple ? */
    multiple?: boolean,

    /**
     * Valeur actuellement sélectionnée.
     *
     * Dans le cas d'un choix multiple, un tableau peut être passé.
     * Si `null` est passé, aucune valeur ne sera sélectionnée.
     */
    value: Option['value'] | Array<Option['value']> | null,

    /**
     * Les options du champ select.
     *
     * Doit être fournie sous forme de tableau d'objet (Une option = Un objet).
     * Voir le type {@link Option} pour plus de détails sur le format de chaque option.
     * Peut également être fourni sous la forme d'un tableau de simples chaînes de caractères.
     */
    options: string[] | Option[],
};

type SelectedValue = string | Option | Array<string | Option> | null;

/** Un champ de formulaire de type sélecteur. */
const Select = defineComponent({
    name: 'Select',
    inject: {
        'input.invalid': { default: { value: false } },
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: {
            type: String as PropType<Props['name']>,
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
        placeholder: {
            type: [Boolean, String] as PropType<Props['placeholder']>,
            default: true,
        },
        autocomplete: {
            type: String as PropType<Props['autocomplete']>,
            default: 'off',
        },
        highlight: {
            type: Boolean as PropType<Props['highlight']>,
            default: false,
        },
        multiple: {
            type: Boolean as PropType<Props['multiple']>,
            default: false,
        },
        value: {
            // TODO [vue@>2.7]: Mettre `[Array, String, Number, null] as PropType<Props['value']>,` en Vue 2.7.
            // @see https://github.com/vuejs/core/issues/3948#issuecomment-860466204
            type: null as unknown as PropType<Props['value']>,
            required: true,
            validator: (value: unknown): boolean => {
                if (value === null) {
                    return true;
                }

                const validateValue = (_value: unknown): boolean => (
                    ['number', 'string'].includes(typeof _value)
                );

                // - Mode multiple.
                if (Array.isArray(value)) {
                    return value.every((_value: unknown) => validateValue(_value));
                }
                return validateValue(value);
            },
        },
        options: {
            type: Array as PropType<Props['options']>,
            required: true,
            validator: (options: unknown): boolean => {
                if (!Array.isArray(options)) {
                    return false;
                }

                return options.every((option: unknown) => {
                    if (typeof option !== 'object' || option === null) {
                        return ['string', 'number'].includes(typeof option);
                    }

                    return ['label', 'value'].every((field: string) => (
                        ['string', 'number'].includes(typeof (option as any)[field])
                    ));
                });
            },
        },
    },
    emits: ['input', 'change'],
    computed: {
        formattedPlaceholder(): string | undefined {
            const { $t: __, placeholder } = this;

            if (placeholder === false) {
                return undefined;
            }

            return placeholder === true
                ? __('please-choose')
                : placeholder;
        },

        inheritedInvalid(): boolean {
            if (this.invalid !== undefined) {
                return this.invalid;
            }

            // @ts-expect-error -- Normalement corrigé lors du passage à Vue 3 (et son meilleur typage).
            // @see https://github.com/vuejs/core/pull/6804
            return this['input.invalid'].value;
        },

        inheritedDisabled(): boolean {
            if (this.disabled !== undefined) {
                return this.disabled;
            }

            // @ts-expect-error -- Normalement corrigé lors du passage à Vue 3 (et son meilleur typage).
            // @see https://github.com/vuejs/core/pull/6804
            return this['input.disabled'].value;
        },

        selected(): SelectedValue {
            const { options, value } = this;

            if (value === null) {
                return null;
            }

            if (this.multiple) {
                return options.filter((option: string | number | Option) => {
                    option = typeof option === 'object' && option !== null
                        ? option.value
                        : option;

                    const isMatching = (_value: string | number): boolean => (
                        option.toString() === _value.toString()
                    );

                    return Array.isArray(value)
                        ? value.some(isMatching)
                        : isMatching(value);
                });
            }

            return options.find((option: string | number | Option) => {
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
        handleInput(selected: SelectedValue) {
            if (this.inheritedDisabled) {
                return;
            }
            let selection: string | number | Array<string | number> = '';

            if (this.multiple) {
                if (selected === null) {
                    selected = [];
                }

                if (!Array.isArray(selected)) {
                    selected = [selected];
                }

                selection = selected.map((item: string | number | Option) => (
                    typeof item === 'object' ? item.value : item
                ));
            } else if (selected === null) {
                selection = '';
            } else if (typeof selected === 'object') {
                selection = (selected as Option).value;
            }

            this.$emit('input', selection);
            this.$emit('change', selection);
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

        const renderHiddenInput = (): JSX.Element | null => {
            if (!name || disabled) {
                return null;
            }

            if (multiple && Array.isArray(value)) {
                return (
                    <Fragment>
                        <input type="hidden" name={name} value="" />
                        {value.map((_value: Option['value']) => (
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
                        'no-options': ({ searching }: { searching: boolean }) => {
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
});

export default Select;
