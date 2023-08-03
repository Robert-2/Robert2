import './index.scss';
import { defineComponent } from '@vue/composition-api';
import groupByCategories from './utils/groupByCategories';
import MaterialsCategoryItem from './CategoryItem';

import type { PropType } from '@vue/composition-api';
import type { BookingMaterial } from './utils/_types';
import type { MaterialsSection } from './utils/groupByCategories';

type Props = {
    /** La liste du matériel du booking à classer. */
    data: BookingMaterial[],

    /** Permet de choisir si on veut afficher les montants de location ou non. */
    withRentalPrices?: boolean,
};

/**
 * MaterialsSorted
 *
 * Affiche la liste de matériel d'un booking (événement ou réservation), classé
 * par catégories (classement par défaut), ou par sous-liste de matériel.
 *
 * Le classement par sous-liste est réservé aux événements. Dans chaque sous-liste,
 * le matériel est aussi classé par catégories.
 */
const MaterialsSorted = defineComponent({
    name: 'MaterialsSorted',
    props: {
        data: {
            type: Array as PropType<Props['data']>,
            required: true,
        },
        withRentalPrices: {
            type: Boolean as PropType<Required<Props>['withRentalPrices']>,
            default: false,
        },
    },
    computed: {
        sorted(): MaterialsSection[] {
            const { data, withRentalPrices } = this;

            const allCategories = this.$store.state.categories.list;
            return groupByCategories(
                data,
                allCategories ?? [],
                withRentalPrices ? 'price' : 'name',
            );
        },
    },
    created() {
        this.$store.dispatch('categories/fetch');
    },
    render() {
        const { sorted, withRentalPrices } = this;

        return (
            <div class="MaterialsSorted">
                {sorted.map((category: MaterialsSection) => (
                    <MaterialsCategoryItem
                        key={category.id}
                        data={category}
                        withRentalPrices={withRentalPrices}
                        class="MaterialsSorted__category"
                    />
                ))}
            </div>
        );
    },
});

export default MaterialsSorted;
