import './index.scss';
import { toRefs, computed, ref } from '@vue/composition-api';
import { useQuery, useQueryProvider } from 'vue-query';
import dispatchMaterialInSections from '@/utils/dispatchMaterialInSections';
import queryClient from '@/globals/queryClient';
import useI18n from '@/hooks/useI18n';
import apiCategories from '@/stores/api/categories';
import MaterialsCategoryItem from './CategoryItem';

// type Props = {
//     /** La liste du matériel. */
//     data: MaterialWithPivot[],

//     /** Permet d'afficher les prix de location ou non. */
//     withRentalPrices?: boolean,

//     /** Pour déplier la liste à l'ouverture du component. */
//     hideDetails?: boolean,
// };

const MIN_COUNT_FOR_HIDE_BUTTON = 20;

// @vue/component
const MaterialsSorted = (props) => {
    const __ = useI18n();
    const { data, withRentalPrices, hideDetails } = toRefs(props);
    const showList = ref(!hideDetails?.value);

    // - Obligation d'utiliser ce hook car on peut être dans une modale
    useQueryProvider(queryClient);
    const { data: allCategories } = useQuery(
        'categories',
        () => apiCategories.all({ paginated: false }),
    );

    const byCategories = computed(() => {
        const categoryNameGetter = (categoryId) => {
            const category = allCategories.value?.find(({ id }) => id === categoryId);
            return category ? category.name : null;
        };
        return dispatchMaterialInSections(data.value, 'category_id', categoryNameGetter, 'price');
    });

    const handleToggleDetails = () => {
        showList.value = !showList.value;
    };

    const handleHideDetails = () => {
        showList.value = false;
    };

    return () => (
        <div class="MaterialsSorted">
            <button
                type="button"
                onClick={handleToggleDetails}
                class={{ 'MaterialsSorted__switch': true, 'info': !showList.value }}
            >
                <i class={{ 'fas': true, 'fa-eye': !showList.value, 'fa-eye-slash': showList.value }} />
                <span class="MaterialsSorted__switch__text">
                    {__(showList.value ? 'hide-materials-details' : 'show-materials-details')}
                </span>
            </button>
            {showList.value && (
                <div class="MaterialsSorted__categories">
                    {byCategories.value.map((category) => (
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

MaterialsSorted.props = {
    data: { type: Array, required: true },
    withRentalPrices: { type: Boolean, default: true },
    hideDetails: { type: Boolean, default: false },
};

export default MaterialsSorted;
