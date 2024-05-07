import './index.scss';
import Decimal from 'decimal.js';
import { defineComponent } from '@vue/composition-api';
import getMaterialQuantity from '../../utils/getMaterialQuantity';
import getMaterialUnitPrice from '../../utils/getMaterialUnitPrice';
import formatAmount from '@/utils/formatAmount';
import Material from './Material';

import type { PropType } from '@vue/composition-api';
import type { MaterialsSection } from '../../utils/groupByCategories';
import type { BookingMaterial } from '../../utils/_types';

type Props = {
    /** La section contenant le nom de la catégorie, et la liste de son matériel. */
    data: MaterialsSection,

    /** Doit-on afficher les montants de location ? */
    withRentalPrices: boolean,
};

/** Une catégorie dans la liste de matériel triée. */
const MaterialsCategoryItem = defineComponent({
    name: 'MaterialsCategoryItem',
    props: {
        data: {
            type: Object as PropType<Required<Props>['data']>,
            required: true,
        },
        withRentalPrices: {
            type: Boolean as PropType<Required<Props>['withRentalPrices']>,
            default: false,
        },
    },
    computed: {
        subTotal(): Decimal {
            const { data, withRentalPrices } = this;
            if (!withRentalPrices) {
                return new Decimal(0);
            }

            return data.materials.reduce(
                (total: Decimal, material: BookingMaterial) => {
                    const unitPrice = getMaterialUnitPrice(material);
                    const quantity = getMaterialQuantity(material);
                    return total.plus(unitPrice.times(quantity));
                },
                new Decimal(0),
            );
        },
    },
    render() {
        const { $t: __, data, withRentalPrices, subTotal } = this;

        return (
            <div class="MaterialsCategoryItem">
                <h4 class="MaterialsCategoryItem__title">
                    {data.name ?? __('not-categorized')}
                </h4>
                <ul class="MaterialsCategoryItem__list">
                    {data.materials.map((material: BookingMaterial) => (
                        <Material
                            key={material.id}
                            material={material}
                            withRentalPrices={withRentalPrices}
                        />
                    ))}
                </ul>
                {withRentalPrices && (
                    <div class="MaterialsCategoryItem__subtotal">
                        <div class="MaterialsCategoryItem__subtotal__name">
                            {__('sub-total')}
                        </div>
                        <div class="MaterialsCategoryItem__subtotal__price">
                            {formatAmount(subTotal)}
                        </div>
                    </div>
                )}
            </div>
        );
    },
});

export default MaterialsCategoryItem;
