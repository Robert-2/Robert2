import { toRefs, computed } from '@vue/composition-api';

import type { Component } from '@vue/composition-api';

export type Props = {
    /**
     * Le nom de l'icône à afficher.
     *
     * Pour une liste exhaustive des codes, voir : https://fontawesome.com/v5.15/icons?m=free
     */
    name: string,

    /** Quelle variante faut-il utiliser pour l'icône ? */
    variant?: 'regular' | 'solid' | 'brands',

    /** Des éventuelles classes supplémentaires qui seront ajoutées au component. */
    class?: string,
};

const VARIANT_MAP = {
    'regular': 'far',
    'solid': 'fas',
    'brands': 'fab',
} as const;

// @vue/component
const Icon: Component<Props> = (props: Props) => {
    const { name, variant } = toRefs(props as Required<Props>);
    const baseClass = computed(() => VARIANT_MAP[variant.value]);
    return () => <i class={[baseClass.value, `fa-${name.value}`]} aria-hidden="true" />;
};

Icon.props = {
    name: { type: String, required: true },
    variant: {
        default: 'solid',
        validator: (value: unknown) => (
            typeof value === 'string' &&
            ['solid', 'regular', 'brands'].includes(value)
        ),
    },
};

export default Icon;
