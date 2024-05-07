import './index.scss';
import invariant from 'invariant';
import { z } from '@/utils/validation';
import { defineComponent } from '@vue/composition-api';

import type { SchemaInfer } from '@/utils/validation';
import type { PropType } from '@vue/composition-api';

const SwitchOptionSchema = z.strictObject({
    /** Le libellé lié à l'option. */
    label: z.string(),

    /** La valeur de l'option du switch. */
    value: z.union([z.string(), z.number(), z.boolean()]),
});

export type SwitchOption = SchemaInfer<typeof SwitchOptionSchema>;

type Props = {
    /**
     * Le nom du champ (attribut `[name]`).
     *
     * Ceci permettra notamment de récupérer la valeur du champ dans
     * le jeu de données d'un formulaire parent lors de la soumission
     * (`submit`) de celui-ci.
     *
     * @default undefined
     */
    name?: string,

    /**
     * Les deux options entres lesquelles l'utilisateur va pouvoir switcher.
     *
     * Par défaut, le champ utilisera un mode minimaliste Oui / Non ou seule
     * l'option actuelle est affichée.
     */
    options?: [left: SwitchOption, right: SwitchOption],

    /**
     * Valeur actuelle du champ.
     *
     * - Si le champ est un switch de base entres une position "Oui" et "Non", un booléen est attendue.
     * - Sinon, s'il y a deux options customs, la valeur (= `value`) d'une des options est attendue.
     */
    value: string | number | boolean,

    /**
     * Le champ est-il désactivé ?
     *
     * Si la valeur de cette prop. est une chaîne de caractère, le champ sera considéré
     * comme désactivé et la chaîne sera utilisée en tant que raison de la désactivation.
     *
     * @default false
     */
    disabled?: boolean | string,

    /**
     * Permet de cacher les libellés affichés à côté du switch lui-même.
     *
     * @default false
     */
    hideLabels?: boolean | string,
};

/** Un sélecteur entre deux options exclusives. */
export default defineComponent({
    name: 'SwitchToggle',
    inject: {
        'input.disabled': { default: { value: false } },
    },
    props: {
        name: {
            type: String as PropType<Required<Props>['name']>,
            default: undefined,
        },
        value: {
            type: [Boolean, String, Number] as PropType<Props['value']>,
            required: true,
        },
        options: {
            type: Array as any as PropType<Props['options']>,
            default: undefined,
            validator: (value: unknown) => {
                const schema = z.tuple([SwitchOptionSchema, SwitchOptionSchema]);
                return schema.safeParse(value).success;
            },
        },
        disabled: {
            type: [Boolean, String] as PropType<Required<Props>['disabled']>,
            default: false,
        },
        hideLabels: {
            type: Boolean as PropType<Required<Props>['disabled']>,
            default: false,
        },
    },
    emits: ['input', 'change'],
    computed: {
        inheritedDisabled(): boolean | string {
            if (this.disabled !== undefined) {
                return this.disabled;
            }

            // @ts-expect-error -- Normalement fixé lors du passage à Vue 3 (et son meilleur typage).
            // @see https://github.com/vuejs/core/pull/6804
            return this['input.disabled'].value;
        },

        disabledReason(): string | null {
            if (!this.inheritedDisabled || typeof this.inheritedDisabled !== 'string') {
                return null;
            }

            const reason = this.inheritedDisabled.trim();
            return reason.length > 0 ? reason : null;
        },

        isToggled(): boolean {
            return this.value === (this.options?.[1].value ?? true);
        },
    },
    mounted() {
        const { options, value } = this;

        invariant(
            options === undefined || options[0].value !== options[1].value,
            `All switch values must be unique, identical values passed.`,
        );

        invariant(
            value === (options?.[0].value ?? false) || value === (options?.[1].value ?? true),
            `The provided value should match one of the options value, received \`${value.toString()}\` instead.`,
        );
    },
    methods: {
        handleSwitch() {
            if (this.inheritedDisabled) {
                return;
            }
            const { value: prevValue, options } = this;

            const newValue: string | number | boolean = (() => {
                if (options === undefined) {
                    return !prevValue;
                }
                return (prevValue === options[0].value ? options[1] : options[0]).value;
            })();

            this.$emit('input', newValue);
            this.$emit('change', newValue);
        },
    },
    render() {
        const {
            $t: __,
            name,
            value,
            options,
            isToggled,
            inheritedDisabled: disabled,
            disabledReason,
            handleSwitch,
            hideLabels,
        } = this;

        const classNames = ['SwitchToggle', {
            'SwitchToggle--toggled': isToggled,
            'SwitchToggle--highlight': options !== undefined || !!value,
            'SwitchToggle--disabled': !!disabled,
        }];

        const renderLeftLabel = (): JSX.Element | null => {
            if (hideLabels || options === undefined) {
                return null;
            }

            const isActive = value === options[0].value;
            return (
                <span
                    class={['SwitchToggle__label', 'SwitchToggle__label--left', {
                        'SwitchToggle__label--active': isActive,
                        'SwitchToggle__label--inactive': !isActive,
                    }]}
                >
                    {options[0].label}
                </span>
            );
        };

        const renderRightLabel = (): JSX.Element | null => {
            if (hideLabels) {
                return null;
            }

            if (options === undefined) {
                return (
                    <span class="SwitchToggle__label">
                        {value ? __('yes') : __('no')}
                    </span>
                );
            }

            const isActive = value === options[1].value;
            return (
                <span
                    class={['SwitchToggle__label', 'SwitchToggle__label--left', {
                        'SwitchToggle__label--active': isActive,
                        'SwitchToggle__label--inactive': !isActive,
                    }]}
                >
                    {options[1].label}
                </span>
            );
        };

        return (
            <div class={classNames} onClick={handleSwitch}>
                <div class="SwitchToggle__field">
                    {renderLeftLabel()}
                    <div class="SwitchToggle__slide">
                        <div class="SwitchToggle__slide__button" />
                    </div>
                    {renderRightLabel()}
                    {!!(disabled && disabledReason) && (
                        <span class="SwitchToggle__disabled-reason">
                            ({__('locked')}: {disabledReason})
                        </span>
                    )}
                </div>
                {!!(name && !disabled) && (
                    <input
                        type="hidden"
                        name={name}
                        value={(
                            typeof value === 'boolean'
                                ? (value ? '1' : '0')
                                : value
                        )}
                    />
                )}
            </div>
        );
    },
});
