import './index.scss';
import { computed, toRefs } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import getMaterialQuantity from '../utils/getMaterialQuantity';
import getMaterialUnitPrice from '../utils/getMaterialUnitPrice';
import formatAmount from '@/utils/formatAmount';
import Icon from '@/themes/default/components/Icon';

// @vue/component
const MaterialsCategoryItem = (props) => {
    const __ = useI18n();
    const { data, withRentalPrices } = toRefs(props);

    const subTotal = computed(() => {
        if (!withRentalPrices.value) {
            return 0;
        }

        return data.value.materials.reduce((total, material) => (
            total + (getMaterialQuantity(material) * getMaterialUnitPrice(material))
        ), 0);
    });

    return () => (
        <div class="MaterialsCategoryItem">
            <h4 class="MaterialsCategoryItem__title">{data.value.name ?? __('not-categorized')}</h4>
            <ul class="MaterialsCategoryItem__list">
                {data.value.materials.map((material) => (
                    <li key={material.id} class="MaterialsCategoryItem__material">
                        <div class="MaterialsCategoryItem__material__name">
                            {material.name}
                        </div>
                        {withRentalPrices.value && (
                            <div class="MaterialsCategoryItem__material__price">
                                {formatAmount(getMaterialUnitPrice(material))}
                            </div>
                        )}
                        <div class="MaterialsCategoryItem__material__quantity">
                            <Icon
                                name="times"
                                class="MaterialsCategoryItem__material__quantity__icon"
                            />
                            {getMaterialQuantity(material)}
                        </div>
                        {withRentalPrices.value && (
                            <div class="MaterialsCategoryItem__material__total">
                                {formatAmount(getMaterialQuantity(material) * getMaterialUnitPrice(material))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            {withRentalPrices.value && (
                <div class="MaterialsCategoryItem__subtotal">
                    <div class="MaterialsCategoryItem__subtotal__name">
                        {__('sub-total')}
                    </div>
                    <div class="MaterialsCategoryItem__subtotal__price">
                        {formatAmount(subTotal.value)}
                    </div>
                </div>
            )}
        </div>
    );
};

MaterialsCategoryItem.props = {
    data: { type: Object, required: true },
    withRentalPrices: { type: Boolean, default: false },
};

export default MaterialsCategoryItem;
