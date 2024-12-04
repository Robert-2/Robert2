import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon, { Variant as IconVariant } from '@/themes/default/components/Icon';
import Fragment from '@/components/Fragment';

import type { Location } from 'vue-router';
import type { TooltipOptions } from 'v-tooltip';
import type { PropType } from '@vue/composition-api';
import type { Props as IconProps } from '@/themes/default/components/Icon';

export const TYPES = [
    'default', 'success', 'warning', 'danger',
    'primary', 'secondary', 'transparent',
] as const;

// NOTE: L'idée ici n'est pas d'ajouter tous les types possibles mais uniquement ceux
// qui se retrouvent à de multiples endroits (pour éviter d'avoir des soucis de cohérence)
const PREDEFINED_TYPES = {
    add: {
        type: 'success',
        icon: 'plus',
    },
    edit: {
        type: 'default',
        icon: 'edit',
    },
    trash: {
        type: 'danger',
        icon: 'trash',
    },
    delete: {
        type: 'danger',
        icon: 'trash-alt',
    },
    restore: {
        type: 'success',
        icon: 'trash-restore',
    },
    close: {
        type: 'transparent',
        icon: 'times',
    },
} as const;

export type PredefinedType = keyof typeof PREDEFINED_TYPES;
export type Type = (typeof TYPES)[number];

type IconName = string | `${string}:${IconVariant}`;
type IconPosition = 'before' | 'after';
type IconOptions = { name: IconName, position?: IconPosition };
export type IconLoose = IconName | IconOptions;

type Props = {
    /**
     * Le type (= variante) du bouton.
     *
     * Deux types de valeurs sont acceptés:
     * - Le nom d'un type bas niveau:
     *   => Ceci permettra de donner un aspect spécifique au bouton.
     *      (Voir {@link TYPES})
     * - Le nom d'un type pré-défini:
     *   => Permet de donner un style "complet" au bouton (aspect + icône)
     *      (Voir {@link PREDEFINED_TYPES})
     *
     * @default 'default'
     */
    type?: PredefinedType | Type,

    /**
     * L'icône à utiliser dans le bouton.
     *
     * Peut contenir une chaîne de caractère avec les composantes suivantes séparées par `:`:
     * - Le nom de l'icône sous forme de chaîne (e.g. `plus`, `wrench`)
     *   Pour une liste exhaustive des codes, voir: https://fontawesome.com/v5.15/icons?m=free
     * - La variante à utiliser de l'icône à utiliser (`solid`, `regular`, ...).
     *
     * Ou bien un objet littéral contenant les clés:
     * - `name`: Le nom de l'icône sous forme de chaîne de caractère.
     *           Sa prise en charge est équivalente à ce qui est décrit ci-dessus.
     * - `position`: La position de l'icône dans le bouton: `before` ou `after`.
     *
     * @example
     * - `wrench`
     * - `wrench:solid`
     * - `{ name: 'wrench:solid', position: 'after' }`
     */
    icon?: IconLoose,

    /**
     * Le type de `<button>` HTML à utiliser.
     * (Uniquement utile lorsque ce component n'est pas utilisé avec la prop. `to`)
     *
     * Valeurs supportées:
     * - `button`: Le bouton n'a pas de comportement par défaut
     *             et ne fait rien automatiquement lorsqu'il est pressé.
     * - `submit`: Le bouton soumettra le formulaire auquel il est lié
     *             lorsqu'il est pressé.
     * - `reset`: Le bouton réinitialisera le formulaire auquel il est lié
     *            lorsqu'il est pressé.
     *
     * @default 'button'
     */
    htmlType?: 'button' | 'submit' | 'reset',

    /**
     * La taille du bouton.
     *
     * @default 'normal'
     */
    size?: 'small' | 'normal' | 'large',

    /**
     * Le contenu d'une éventuelle infobulle qui sera affichée au survol du bouton.
     *
     * La valeur peut avoir deux formats différents:
     * - Une chaîne de caractère: Celle-ci sera utilisée pour le contenu de l'infobulle
     *   qui sera elle-même affichée centrée en dessous du bouton au survol.
     * - Un object de configuration contenant les clés:
     *   - `content`: Le texte affiché dans l'infobulle.
     *   - `placement`: La position de l'infobulle par rapport au bouton.
     *                  (e.g. `top`, `bottom`, `left`, `right`, ...)
     */
    tooltip?: string | TooltipOptions,

    /**
     * La cible du bouton sous forme de chaîne ou d'objet `Location` compatible avec Vue-Router.
     *
     * Si non définie, un élément HTML `<button>` sera utilisé et
     * vous devriez écouter l'événement `onClick` pour réagir au click.
     */
    to?: string | Location,

    /**
     * Permet d'indiquer que c'est un bouton avec cible externe.
     *
     * Si c'est le cas, le component fonctionnera comme suit:
     * - Le routing interne ("Vue Router"), ne sera pas utilisé.
     *   (Il ne faut donc pas passer d'objet à `to` mais bien une chaîne)
     * - Si c'est une URL absolue, celle-ci s'ouvrira dans une autre fenêtre / onglet.
     *
     * @default false
     */
    external?: boolean,

    /**
     * Le bouton doit-il afficher un indicateur de chargement ?
     *
     * Si `true` et que le bouton dispose d'une icône, celle-ci sera
     * "remplacée" par l'indicateur de chargement. Le bouton continuera
     * de réagir au clics lorsque `loading` est à `true`.
     *
     * @default false
     */
    loading?: boolean,

    /**
     * Le bouton peut-il être affiché de manière minimaliste
     * (= uniquement l'icône) pour les petits écrans ?
     *
     * Quand cette prop. vaut `true`, pour les écrans plus petit que le format
     * tablette, si le bouton comporte une icône, seule celle-ci sera affichée.
     *
     * @default false
     */
    collapsible?: boolean,

    /**
     * Le bouton est-il désactivé ?
     *
     * Si `true` et qu'il est cliqué, le bouton ne réagira pas.
     *
     * @default false
     */
    disabled?: boolean,
};

/** Un bouton. */
const Button = defineComponent({
    name: 'Button',
    props: {
        htmlType: {
            type: String as PropType<Required<Props>['htmlType']>,
            default: 'button',
            validator: (value: unknown) => (
                typeof value === 'string' &&
                ['button', 'submit', 'reset'].includes(value)
            ),
        },
        type: {
            type: String as PropType<Required<Props>['type']>,
            default: 'default',
            validator: (value: unknown) => (
                typeof value === 'string' &&
                [TYPES, Object.keys(PREDEFINED_TYPES)]
                    .flat().includes(value)
            ),
        },
        tooltip: {
            type: [String, Object] as PropType<Props['tooltip']>,
            default: undefined,
        },
        icon: {
            type: [String, Object] as PropType<Props['icon']>,
            default: undefined,
        },
        size: {
            type: String as PropType<Required<Props>['size']>,
            default: 'normal',
            validator: (value: unknown) => (
                typeof value === 'string' &&
                ['small', 'normal', 'large'].includes(value)
            ),
        },
        loading: {
            type: Boolean as PropType<Required<Props>['loading']>,
            default: false,
        },
        to: {
            type: [String, Object] as PropType<Props['to']>,
            default: undefined,
        },
        external: {
            type: Boolean as PropType<Required<Props>['external']>,
            default: false,
        },
        collapsible: {
            type: Boolean as PropType<Required<Props>['collapsible']>,
            default: false,
        },
        disabled: {
            type: Boolean as PropType<Required<Props>['disabled']>,
            default: false,
        },
    },
    emits: ['click'],
    computed: {
        predefinedValue(): typeof PREDEFINED_TYPES[PredefinedType] | undefined {
            if (!Object.keys(PREDEFINED_TYPES).includes(this.type)) {
                return undefined;
            }
            return PREDEFINED_TYPES[this.type as PredefinedType];
        },

        normalizedType(): Type {
            const predefinedValue = this.predefinedValue?.type;
            return predefinedValue !== undefined
                ? (predefinedValue ?? 'default')
                : (this.type as Type);
        },

        normalizedIcon(): IconProps | undefined {
            if (this.loading) {
                return { name: 'spinner', spin: true };
            }

            let icon;
            icon = this.icon ?? this.predefinedValue?.icon;
            icon = typeof icon === 'object' ? icon.name : icon;
            if (!icon) {
                return undefined;
            }

            if (!icon.includes(':')) {
                return { name: icon };
            }

            const [iconType, variant] = icon.split(':');
            return Object.values(IconVariant).includes(variant as any)
                ? { name: iconType, variant: variant as IconVariant }
                : { name: iconType };
        },

        iconPosition(): IconPosition {
            const icon = this.icon ?? this.predefinedValue?.icon;
            const position = typeof icon === 'object' ? icon.position : undefined;
            return position ?? 'before';
        },

        normalizedTooltip(): TooltipOptions | string | undefined {
            return typeof this.tooltip === 'object'
                ? { ...this.tooltip, content: this.tooltip.content }
                : this.tooltip;
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleClick(e: MouseEvent) {
            if (this.disabled) {
                return;
            }
            this.$emit('click', e);
        },
    },
    render() {
        const children = this.$slots.default;
        const {
            to,
            size,
            loading,
            disabled,
            collapsible,
            external,
            htmlType,
            iconPosition,
            normalizedType: type,
            normalizedIcon: icon,
            normalizedTooltip: tooltip,
            handleClick,
        } = this;

        const classNames = [
            'Button',
            `Button--${type}`,
            `Button--${size}`,
            {
                'Button--collapsible': collapsible,
                'Button--with-icon': icon !== undefined,
                'Button--disabled': disabled || loading,
                'Button--loading': loading,
            },
        ];

        const content = (
            <Fragment>
                {(icon && iconPosition === 'before') && (
                    <Icon {...{ props: icon }} class="Button__icon" />
                )}
                {children && <span class="Button__content">{children}</span>}
                {(icon && iconPosition === 'after') && (
                    <Icon {...{ props: icon }} class="Button__icon" />
                )}
            </Fragment>
        );

        if (to && !disabled) {
            if (external) {
                const isOutside = typeof to === 'string' && to.includes('://');

                return (
                    <a
                        href={to}
                        v-tooltip={tooltip}
                        class={classNames}
                        target={isOutside ? '_blank' : undefined}
                        rel={isOutside ? 'noreferrer noopener' : undefined}
                    >
                        {content}
                    </a>
                );
            }

            return (
                <router-link to={to} custom>
                    {({ href, navigate: handleNavigate }: any) => (
                        <a
                            href={href}
                            onClick={handleNavigate}
                            v-tooltip={tooltip}
                            class={classNames}
                        >
                            {content}
                        </a>
                    )}
                </router-link>
            );
        }

        return (
            <button
                // eslint-disable-next-line react/button-has-type
                type={htmlType}
                class={classNames}
                disabled={disabled || loading}
                v-tooltip={tooltip}
                onClick={handleClick}
            >
                {content}
            </button>
        );
    },
});

export default Button;
