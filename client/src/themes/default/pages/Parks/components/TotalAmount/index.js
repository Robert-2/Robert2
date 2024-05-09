import './index.scss';
import apiParks from '@/stores/api/parks';
import Button from '@/themes/default/components/Button';
import formatAmount from '@/utils/formatAmount';

// @vue/component
export default {
    name: 'ParksTotalAmount',
    props: {
        park: { type: Object, required: true },
    },
    data() {
        return {
            amount: null,
            loading: false,
        };
    },
    methods: {
        async handleCalculate() {
            const { id } = this.park;
            this.loading = true;
            try {
                this.amount = await apiParks.oneTotalAmount(id);
            } catch {
                const { $t: __ } = this;
                this.$toasted.error(__('errors.unexpected-while-calculating'));
            } finally {
                this.loading = false;
            }
        },
    },
    render() {
        const { $t: __, park, handleCalculate, loading, amount } = this;
        const { total_items: itemsCount } = park;

        if (!itemsCount) {
            return null;
        }

        return (
            <div class="ParksTotalAmount">
                {amount === null && (
                    <Button onClick={handleCalculate} loading={loading}>
                        {__('calculate')}
                    </Button>
                )}
                {amount !== null && (
                    <div class="ParksTotalAmount__amount">
                        {formatAmount(amount)}
                    </div>
                )}
            </div>
        );
    },
};
