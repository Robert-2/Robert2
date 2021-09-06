import './index.scss';
import { ref, toRefs } from '@vue/composition-api';
import requester from '@/globals/requester';
import formatAmount from '@/utils/formatAmount';
import useI18n from '@/hooks/useI18n';
import ErrorMessage from '@/components/ErrorMessage/index';

import type { Render } from '@vue/composition-api';

type Props = {
    parkId: number,
};

type State = {
    amount: number | null,
    loading: boolean,
    error: unknown | null,
};

// @vue/component
const ParkTotalAmount = (props: Props): Render => {
    const __ = useI18n();
    const { parkId } = toRefs(props);

    const state = ref<State>({
        amount: null,
        loading: false,
        error: null,
    });

    const handleCalculate = async (): Promise<void> => {
        state.value.loading = true;
        try {
            const { data } = await requester.get(`parks/${parkId.value}/total-amount`);
            state.value.amount = data.totalAmount;
        } catch (error) {
            state.value.error = error;
        } finally {
            state.value.loading = false;
        }
    };

    return () => {
        const { loading, error, amount } = state.value;

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
                {/* @ts-ignore TODO: Migrer le component ErrorMessage avec TS */}
                {error && <ErrorMessage error={error} />}
                {amount !== null && (
                    <div class="ParkTotalAmount__amount">
                        {formatAmount(amount)}
                    </div>
                )}
            </div>
        );
    };
};

ParkTotalAmount.props = {
    parkId: { type: Number, required: true },
};

export default ParkTotalAmount;
