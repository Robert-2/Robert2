import './index.scss';
import { defineComponent } from '@vue/composition-api';
import formatAmount from '@/utils/formatAmount';
import getMaterialUnitPrice from '../../utils/getMaterialUnitPrice';
import getMaterialQuantity from '../../utils/getMaterialQuantity';
import Icon from '@/themes/default/components/Icon';

import type { PropType } from '@vue/composition-api';
import type { BookingMaterial } from '../../utils/_types';

type Props = {
    material: BookingMaterial,
    withRentalPrices: boolean,
};

const MaterialsCategoryItemMaterial = defineComponent({
    name: 'MaterialsCategoryItemMaterial',
    props: {
        material: {
            type: Object as PropType<Required<Props>['material']>,
            required: true,
        },
        withRentalPrices: {
            type: Boolean as PropType<Required<Props>['withRentalPrices']>,
            default: false,
        },
    },
    render() {
        const { material, withRentalPrices } = this;
        return (
            <li class="MaterialsCategoryItemMaterial">
                <div class="MaterialsCategoryItemMaterial__name">
                    <div class="MaterialsCategoryItemMaterial__name__label">
                        {material.name}
                    </div>
                </div>
                {withRentalPrices && (
                    <div class="MaterialsCategoryItemMaterial__price">
                        {formatAmount(getMaterialUnitPrice(material))}
                    </div>
                )}
                <div class="MaterialsCategoryItemMaterial__quantity">
                    <Icon
                        name="times"
                        class="MaterialsCategoryItemMaterial__quantity__icon"
                    />
                    {getMaterialQuantity(material)}
                </div>
                {withRentalPrices && (
                    <div class="MaterialsCategoryItemMaterial__total">
                        {formatAmount(getMaterialQuantity(material) * getMaterialUnitPrice(material))}
                    </div>
                )}
            </li>
        );
    },
});

export default MaterialsCategoryItemMaterial;
