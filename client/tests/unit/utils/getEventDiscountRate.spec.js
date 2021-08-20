import getEventDiscountRate from '@/utils/getEventDiscountRate';

describe('getEventDiscountRate', () => {
    it('should return default value when the event has no bill or estimate', () => {
        expect(getEventDiscountRate({}, 32)).toEqual(32);
        expect(getEventDiscountRate({ bills: [], estimates: [] }, 32)).toEqual(32);
    });

    it('should return 0 when the event has no bill or estimate and no default value specified', () => {
        expect(getEventDiscountRate({})).toEqual(0);
        expect(getEventDiscountRate({ bills: [], estimates: [] })).toEqual(0);
    });

    it('should return the last bill discount rate first', () => {
        const event = {
            bills: [
                { discount_rate: 15 },
                { discount_rate: 20 },
            ],
            estimates: [
                { discount_rate: 30 },
            ],
        };
        expect(getEventDiscountRate(event, 100)).toEqual(15);
    });

    it('returns the last estimate discount rate when no last bill given', () => {
        const event = {
            bills: [],
            estimates: [
                { discount_rate: 20 },
                { discount_rate: 25 },
            ],
        };
        expect(getEventDiscountRate(event, 100)).toEqual(20);
    });
});
