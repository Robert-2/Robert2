import Decimal from 'decimal.js';

import type { EventDetails } from '@/stores/api/events';

const getEventDiscountRate = (event: EventDetails): Decimal => {
    if (event.is_billable) {
        const lastInvoice = [...(event.invoices ?? [])].shift();
        if (lastInvoice !== undefined) {
            return lastInvoice.discount_rate;
        }

        const lastEstimate = [...(event.estimates ?? [])].shift();
        if (lastEstimate !== undefined) {
            return lastEstimate.discount_rate;
        }
    }
    return new Decimal(0);
};

export default getEventDiscountRate;
