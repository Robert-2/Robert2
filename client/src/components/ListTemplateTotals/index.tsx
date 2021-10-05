import './index.scss';
import { toRefs, computed } from '@vue/composition-api';
import { Fragment } from 'vue-fragment';
import useI18n from '@/hooks/useI18n';
import formatAmount from '@/utils/formatAmount';

import type { Render } from '@vue/composition-api';
import type { MaterialWithPivot } from '@/stores/api/materials';

type Props = {
    materials: MaterialWithPivot[],
};

// @vue/component
const ListTemplateTotals = (props: Props): Render => {
    const __ = useI18n();
    const { materials } = toRefs(props);

    const totalItems = computed(() => materials.value.length);

    const totalItemsQuantity = computed(() => (
        materials.value.reduce((acc: number, material: MaterialWithPivot) => (
            acc + material.pivot.quantity
        ), 0)
    ));

    const totalItemsAmount = computed(() => (
        materials.value.reduce((acc: number, material: MaterialWithPivot) => (
            acc + (material.pivot.quantity * material.rental_price)
        ), 0)
    ));

    const totalItemsReplacementAmount = computed(() => (
        materials.value.reduce((acc: number, material: MaterialWithPivot) => (
            acc + (material.pivot.quantity * material.replacement_price)
        ), 0)
    ));

    return () => (
        <ul class="ListTemplateTotals">
            {totalItems.value === 0 && (
                <li class="ListTemplateTotals__item ListTemplateTotals__item--empty">
                    {__('no-items')}
                </li>
            )}
            {totalItems.value > 0 && (
                <Fragment>
                    <li class="ListTemplateTotals__item">
                        {__('total-quantity', { total: totalItemsQuantity.value })}{' '}
                        <small>({__('items-count', { count: totalItems.value }, totalItems.value)})</small>
                    </li>
                    <li class="ListTemplateTotals__item">
                        {__('daily-amount', { amount: formatAmount(totalItemsAmount.value) })}
                    </li>
                    <li class="ListTemplateTotals__item">
                        {__('replacement-value-amount', {
                            amount: formatAmount(totalItemsReplacementAmount.value),
                        })}
                    </li>
                </Fragment>
            )}
        </ul>
    );
};

ListTemplateTotals.props = {
    materials: { type: Array, required: true },
};

export default ListTemplateTotals;
