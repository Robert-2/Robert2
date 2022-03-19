import { toRefs, computed } from '@vue/composition-api';

// type Props = {
//     /**
//      * Le nom de l'icône à afficher.
//      *
//      * Pour une liste exhaustive des codes, voir : https://fontawesome.com/v5.15/icons?m=free
//      */
//     name: string,

//     /** Quelle variante faut-il utiliser pour l'icône ? */
//     variant?: 'regular' | 'solid' | 'brands',

//     /** Des éventuelles classes supplémentaires qui seront ajoutées au component. */
//     class?: string,
// };

const VARIANT_MAP = {
    'regular': 'far',
    'solid': 'fas',
    'brands': 'fab',
};

// @vue/component
const Icon = (props) => {
    const { name, variant, spin } = toRefs(props);
    const baseClass = computed(() => VARIANT_MAP[variant.value]);
    return () => (
        <i
            class={[baseClass.value, `fa-${name.value}`, { 'fa-spin': spin.value }]}
            aria-hidden="true"
        />
    );
};

Icon.props = {
    name: { type: String, required: true },
    variant: {
        default: 'solid',
        validator: (value) => (
            typeof value === 'string' &&
            ['solid', 'regular', 'brands'].includes(value)
        ),
    },
    spin: { type: Boolean, default: false },
};

export default Icon;
