import './index.scss';

// @vue/component
export default {
    name: 'ParksItemsCount',
    props: {
        park: { type: Object, required: true },
    },
    render() {
        const { $t: __, park } = this;
        const { id, total_items: itemsCount, total_stock_quantity: totalStockCount } = park;

        const hasItems = itemsCount > 0;
        if (!hasItems) {
            return (
                <div class="ParksItemsCount ParksItemsCount--empty">
                    {__('no-items')}
                </div>
            );
        }

        return (
            <div class="ParksItemsCount">
                <router-link
                    to={{ name: 'materials', query: { park: id } }}
                    v-tooltip={__('page.parks.display-materials-of-this-park')}
                    class="ParksItemsCount__link"
                >
                    {__('items-count', { count: itemsCount }, itemsCount)}
                </router-link>
                <div class="ParksItemsCount__total-stock">
                    ({__('stock-items-count', { count: totalStockCount })})
                </div>
            </div>
        );
    },
};
