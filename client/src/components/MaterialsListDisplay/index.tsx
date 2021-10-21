import './index.scss';
import { toRefs, computed, ref } from '@vue/composition-api';
import { useQuery, useQueryProvider } from 'vue-query';
import dispatchMaterialInSections from '@/utils/dispatchMaterialInSections';
import queryClient from '@/globals/queryClient';
import useI18n from '@/hooks/useI18n';
import apiCategories from '@/stores/api/categories';
import Toggle from './Toggle';
import MaterialsCategoryItem from './CategoryItem';

import type { Render } from '@vue/composition-api';
import type { MaterialWithPivot } from '@/stores/api/materials';
import type { Category } from '@/stores/api/categories';

type Props = {
    data: MaterialWithPivot[],
    withRentalPrices?: boolean,
    hideDetails?: boolean,
};

export type MaterialCategoryItem = {
    id: number,
    name: string,
    materials: MaterialWithPivot[],
    subTotal: number,
};

const MIN_COUNT_FOR_HIDE_BUTTON = 20;

// @vue/component
const MaterialsListDisplay = (props: Props): Render => {
    const __ = useI18n();
    const { data, withRentalPrices, hideDetails } = toRefs(props);

    const showList = ref<boolean>(!hideDetails?.value);

    // - Obligation d'utiliser ce hook car on peut être dans une modale
    useQueryProvider(queryClient);
    const { data: allCategories } = useQuery<Category[]>(
        'categories',
        () => apiCategories.all({ paginated: false }),
    );

    const byCategories = computed<MaterialCategoryItem[]>(() => {
        const categoryNameGetter = (categoryId: number): string | null => {
            const category = allCategories.value?.find(({ id }: Category) => id === categoryId);
            return category ? category.name : null;
        };
        return dispatchMaterialInSections(data.value, 'category_id', categoryNameGetter, 'price');
    });

    const handleToggleDetails = (): void => {
        showList.value = !showList.value;
    };

    const handleHideDetails = (): void => {
        showList.value = false;
    };

    return () => (
        <div class="MaterialsListDisplay">
            <Toggle
                displayed={showList.value}
                onToggle={handleToggleDetails}
            />
            {showList.value && (
                <div class="MaterialsListDisplay__categories">
                    {byCategories.value.map((category: MaterialCategoryItem) => (
                        <MaterialsCategoryItem
                            key={category.id}
                            data={category}
                            withRentalPrices={withRentalPrices?.value || false}
                        />
                    ))}
                    {data.value.length > MIN_COUNT_FOR_HIDE_BUTTON && (
                        <button type="button" onClick={handleHideDetails}>
                            <i class="fas fa-eye-slash" /> {__('hide-materials-details')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

MaterialsListDisplay.props = {
    data: { type: Array, required: true },
    withRentalPrices: { type: Boolean, default: true },
    hideDetails: { type: Boolean, default: false },
};

export default MaterialsListDisplay;
