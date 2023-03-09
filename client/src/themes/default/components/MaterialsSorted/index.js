import './index.scss';
import { toRefs, computed } from '@vue/composition-api';
import { useQuery, useQueryProvider } from 'vue-query';
import queryClient from '@/globals/queryClient';
import apiCategories from '@/stores/api/categories';
import groupByCategories from './utils/groupByCategories';
import MaterialsCategoryItem from './CategoryItem';

// @vue/component
const MaterialsSorted = (props) => {
    const { data, withRentalPrices } = toRefs(props);

    // - Obligation d'utiliser ce hook car on peut être dans une modale
    useQueryProvider(queryClient);
    const { data: allCategories } = useQuery({
        queryKey: 'categories',
        queryFn: () => apiCategories.all(),
    });

    const byCategories = computed(() => (
        groupByCategories(
            data.value,
            allCategories.value ?? [],
            withRentalPrices.value ? 'price' : 'name',
        )
    ));

    return () => (
        <div class="MaterialsSorted">
            {byCategories.value.map((category) => (
                <MaterialsCategoryItem
                    key={category.id}
                    data={category}
                    withRentalPrices={withRentalPrices.value}
                    class="MaterialsSorted__category"
                />
            ))}
        </div>
    );
};

MaterialsSorted.props = {
    data: { type: Array, required: true },
    withRentalPrices: { type: Boolean, default: true },
};

export default MaterialsSorted;
