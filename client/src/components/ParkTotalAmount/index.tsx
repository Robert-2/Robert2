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

// @vue/component
const ParkTotalAmount = (props: Props): Render => {
    const __ = useI18n();
    const { parkId } = toRefs(props);
    const isLoading = ref(false);
    const amount = ref<number | null>(null);
    const error = ref<Error | string | null>(null);

    const handleCalculate = async (): Promise<void> => {
        isLoading.value = true;
        try {
            const { data } = await requester.get(`parks/${parkId.value}/total-amount`);
            amount.value = data.totalAmount;
        } catch (_error) {
            if (!(_error instanceof Error) || typeof _error !== 'string') {
                return;
            }
            error.value = _error;
        } finally {
            isLoading.value = false;
        }
    };

    return () => (
        <div class="ParkTotalAmount">
            {amount.value === null && (
                <button
                    type="button"
                    class="ParkTotalAmount__calc-button"
                    onClick={handleCalculate}
                    disabled={isLoading.value}
                >
                    {isLoading.value ? <i class="fas fa-spin fa-circle-notch" /> : __('calculate')}
                </button>
            )}
            {error.value && <ErrorMessage error={error.value} />}
            {amount.value !== null && (
                <div class="ParkTotalAmount__amount">
                    {formatAmount(amount.value)}
                </div>
            )}
        </div>
    );
};

ParkTotalAmount.props = {
    parkId: { type: Number, required: true },
};

export default ParkTotalAmount;
