import './index.scss';
import { Fragment } from 'vue-fragment';
import { toRefs } from '@vue/composition-api';
import useI18n from '@/hooks/vue/useI18n';
import ParkTotalAmount from '@/components/ParkTotalAmount';

// @vue/component
const ParkTotals = (props) => {
    const __ = useI18n();
    const { park } = toRefs(props);

    return () => {
        const { id, total_items: itemsCount, total_stock_quantity: stockCount } = park.value;

        return (
            <div class="ParkTotals">
                <h3>{__('page-parks.total-items')}</h3>
                {itemsCount === 0 && (
                    <div class="Park__totals__no-items">{__('no-items')}</div>
                )}
                {itemsCount > 0 && (
                    <Fragment>
                        <div class="ParkTotals__items">
                            <p>
                                <strong>
                                    {__('items-count', { count: itemsCount }, itemsCount)}
                                </strong>{' '}
                                <span class="ParkTotals__stock">
                                    ({__('stock-items-count', { count: stockCount })})
                                </span>
                            </p>
                            <p>
                                <router-link to={`/materials?park=${id}`}>
                                    {__('page-parks.display-materials-of-this-park')}
                                </router-link>
                            </p>
                        </div>
                        <div class="ParkTotals__amount">
                            <span class="ParkTotals__amount__title">{__('total-amount')} :</span>
                            <ParkTotalAmount parkId={id} />
                        </div>
                    </Fragment>
                )}
            </div>
        );
    };
};

ParkTotals.props = {
    park: { type: Object, required: true },
};

export default ParkTotals;
