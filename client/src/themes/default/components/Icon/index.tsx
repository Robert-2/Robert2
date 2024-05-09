import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';

/** Les différentes variantes disponibles pour les icônes. */
export enum Variant {
    REGULAR = 'regular',
    SOLID = 'solid',
    BRANDS = 'brands',
}

const VARIANT_MAP = {
    [Variant.REGULAR]: 'far',
    [Variant.SOLID]: 'fas',
    [Variant.BRANDS]: 'fab',
} as const;

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
            default: Variant.SOLID,
            validator: (value: unknown) => (
                typeof value === 'string' &&
                Object.values(Variant).includes(value as any)
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
