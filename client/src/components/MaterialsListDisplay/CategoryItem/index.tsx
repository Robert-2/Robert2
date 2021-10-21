import './index.scss';
import { toRefs } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import formatAmount from '@/utils/formatAmount';

import type { Component } from '@vue/composition-api';
import type { MaterialWithPivot } from '@/stores/api/materials';
import type { MaterialCategoryItem } from '..';

type Props = {
    data: MaterialCategoryItem,
    withRentalPrices?: boolean,
};

// @vue/component
const MaterialsCategoryItem: Component<Props> = (props: Props) => {
    const __ = useI18n();
    const { data, withRentalPrices } = toRefs(props);

    return () => (
        <div class="MaterialsCategoryItem">
            <h4 class="MaterialsCategoryItem__title">{data.value.name}</h4>
            <ul class="MaterialsCategoryItem__list">
                {data.value.materials.map((material: MaterialWithPivot) => (
                    <li key={material.id} class="MaterialsCategoryItem__material">
                        <div class="MaterialsCategoryItem__material__quantity-first">
                            {material.pivot.quantity}
                        </div>
                        <div class="MaterialsCategoryItem__material__name">
                            {material.name}
                        </div>
                        {withRentalPrices?.value && (
                            <div class="MaterialsCategoryItem__material__price">
                                {formatAmount(material.rental_price)}
                            </div>
                        )}
                        <div class="MaterialsCategoryItem__material__quantity">
                            <i class="fas fa-times" /> {material.pivot.quantity}
                        </div>
                        {withRentalPrices?.value && (
                            <div class="MaterialsCategoryItem__material__total">
                                {formatAmount(material.pivot.quantity * material.rental_price)}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            {withRentalPrices?.value && (
                <div class="MaterialsCategoryItem__subtotal">
                    <div class="MaterialsCategoryItem__subtotal__name">
                        {__('sub-total')}
                    </div>
                    <div class="MaterialsCategoryItem__subtotal__price">
                        {formatAmount(data.value.subTotal)}
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
