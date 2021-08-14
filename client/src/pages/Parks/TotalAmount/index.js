import './index.scss';
import ErrorMessage from '@/components/ErrorMessage/index';
import formatAmount from '@/utils/formatAmount';

// @vue/component
export default {
    name: 'ParkTotalAmount',
    props: {
        parkId: Number,
    },
    data() {
        return {
            amount: null,
            loading: false,
            error: null,
        };
    },
    methods: {
        async handleCalculate() {
            this.loading = true;
            try {
                const { data } = await this.$http.get(`parks/${this.parkId}/total-amount`);
                this.amount = data.totalAmount;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
    },
    render() {
        const { $t: __, handleCalculate, loading, error, amount } = this;

        return (
            <div class="ParkTotalAmount">
                {amount === null && (
                    <button
                        type="button"
                        class="ParkTotalAmount__calc-button"
                        onClick={handleCalculate}
                        disabled={loading}
                    >
                        {loading ? <i class="fas fa-spin fa-circle-notch" /> : __('calculate')}
                    </button>
                )}
                {error && <ErrorMessage error={error} />}
                {amount !== null && (
                    <div class="ParkTotalAmount__amount">
                        {formatAmount(amount)}
                    </div>
                )}
            </div>
        );
    },
};
