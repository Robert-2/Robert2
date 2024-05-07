import getEventDiscountRate from '@/utils/getEventDiscountRate';
import events from '@fixtures/parsed/events';
import Decimal from 'decimal.js';

import type { EventDetails } from '@/stores/api/events';

describe('getEventDiscountRate', () => {
    it('should return zero when the event has no invoice nor estimate.', () => {
        const result = getEventDiscountRate(events.details(2) as EventDetails<true>);
        expect(result).toBeInstanceOf(Decimal);
        expect(result.toString()).toEqual('0');
    });

    it('should return the last invoice discount rate, event if the event has an estimate.', () => {
        const result = getEventDiscountRate(events.details(1) as EventDetails<true>);
        expect(result).toBeInstanceOf(Decimal);
        expect(result.toString()).toEqual('4.4766');
    });

    it('should return the last estimate discount rate when there is no invoice.', () => {
        const event = events.details(1) as EventDetails<true>;
        const result = getEventDiscountRate({ ...event, invoices: [] });
        expect(result).toBeInstanceOf(Decimal);
        expect(result.toString()).toEqual('5');
    });
});
