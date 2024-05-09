import './index.scss';
import Decimal from 'decimal.js';
import { defineComponent } from '@vue/composition-api';
import formatAmount from '@/utils/formatAmount';
import getMaterialUnitPrice from '../../../utils/getMaterialUnitPrice';
import getMaterialQuantity from '../../../utils/getMaterialQuantity';
import Icon from '@/themes/default/components/Icon';

import type { PropType } from '@vue/composition-api';
import type { BookingMaterial } from '../../../utils/_types';

type Props = {
    /** Le matériel à afficher. */
    material: BookingMaterial,

    /** Doit-on afficher les montants de location ? */
    withRentalPrices: boolean,
};

/** Un matériel dans une catégorie de la liste de matériel triée. */
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
    computed: {
        unitPrice(): Decimal {
            if (!this.withRentalPrices) {
                return new Decimal(0);
            }
            return getMaterialUnitPrice(this.material);
        },

        quantity(): number {
            return getMaterialQuantity(this.material);
        },

        totalPrice(): Decimal {
            const { unitPrice, quantity } = this;
            return unitPrice.times(quantity);
        },
    },
    render() {
        const {
            $t: __,
            material,
            unitPrice,
            quantity,
            totalPrice,
            withRentalPrices,
        } = this;

        return (
            <li class="MaterialsCategoryItemMaterial">
                <div class="MaterialsCategoryItemMaterial__label">
                    <div class="MaterialsCategoryItemMaterial__label__name">
                        {material.name}
                    </div>
                    <span class="MaterialsCategoryItemMaterial__label__ref">
                        {__('ref-ref', { reference: material.reference })}
                    </span>
                </div>
                {withRentalPrices && (
                    <div class="MaterialsCategoryItemMaterial__price">
                        {formatAmount(unitPrice)}
                    </div>
                )}
                <div class="MaterialsCategoryItemMaterial__quantity">
                    <Icon
                        name="times"
                        class="MaterialsCategoryItemMaterial__quantity__icon"
                    />
                    {quantity}
                </div>
                {withRentalPrices && (
                    <div class="MaterialsCategoryItemMaterial__total">
                        {formatAmount(totalPrice)}
                    </div>
                )}
            </li>
        );
    },
});

export default MaterialsCategoryItemMaterial;
