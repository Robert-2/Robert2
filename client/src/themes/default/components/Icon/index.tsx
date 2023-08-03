import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';

const VARIANT_MAP = {
    'regular': 'far',
    'solid': 'fas',
    'brands': 'fab',
} as const;

/** Représente le nom d'une variante d'icône. */
export type Variant = keyof typeof VARIANT_MAP;

/** Les différentes variantes disponibles pour les icônes. */
export const VARIANTS = Object.keys(VARIANT_MAP) as unknown as Variant;

export type Props = {
    /**
     * Le nom de l'icône à afficher.
     *
     * Pour une liste exhaustive des codes, voir: https://fontawesome.com/v5.15/icons?m=free
     */
    name: string,

    /** Quelle variante faut-il utiliser pour l'icône ? */
    variant?: Variant,

    /** L'icône doit-elle tourner sur elle-même ? */
    spin?: boolean,
};

/** Une icône. */
const Icon = defineComponent({
    name: 'Icon',
    props: {
        name: {
            type: String as PropType<Props['name']>,
            required: true,
        },
        variant: {
            type: String as PropType<Required<Props>['variant']>,
            default: 'solid',
            validator: (value: unknown) => (
                typeof value === 'string' &&
                VARIANTS.includes(value)
            ),
        },
        spin: {
            type: Boolean as PropType<Required<Props>['spin']>,
            default: false,
        },
    },
    render() {
        const { name, variant, spin } = this;

        const classNames = ['Icon', VARIANT_MAP[variant], `fa-${name}`, {
            'fa-spin': spin,
        }];

        return <i class={classNames} aria-hidden="true" />;
    },
});

export default Icon;
