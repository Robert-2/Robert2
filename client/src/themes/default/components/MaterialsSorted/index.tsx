import './index.scss';
import { defineComponent } from '@vue/composition-api';
import groupByCategories from './utils/groupByCategories';
import MaterialsCategoryItem from './CategoryItem';

import type { PropType } from '@vue/composition-api';
import type { BookingMaterial } from './utils/_types';
import type { MaterialsSection } from './utils/groupByCategories';

type Props = {
    data: BookingMaterial[],
    withRentalPrices: boolean,
};

// @vue/component
const MaterialsSorted = defineComponent({
    name: 'MaterialsSorted',
    props: {
        data: {
            type: Array as PropType<Required<Props>['data']>,
            required: true,
        },
        withRentalPrices: {
            type: Boolean as PropType<Required<Props>['withRentalPrices']>,
            default: true,
        },
    },
    computed: {
        byCategories(): MaterialsSection[] {
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
        const { byCategories, withRentalPrices } = this;

        return (
            <div class="MaterialsSorted">
                {byCategories.map((category: MaterialsSection) => (
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
