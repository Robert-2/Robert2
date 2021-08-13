import getDiscountRateFromLast from '@/utils/getDiscountRateFromLast';

describe('getDiscountRateFromLast', () => {
    it('returns 0 when nothing given', () => {
        const result = getDiscountRateFromLast();
        expect(result).toEqual(0);
    });

    it('returns the given number when there is no last bill nor last estimate', () => {
        const result = getDiscountRateFromLast(null, null, 32);
        expect(result).toEqual(32);
    });

    it('returns the last bill discount rate', () => {
        const lastBill = { discount_rate: 15 };
        const result = getDiscountRateFromLast(lastBill, null);
        expect(result).toEqual(15);
    });

    it('returns the last estimate discount rate when no last bill given', () => {
        const lastEstimate = { discount_rate: 20 };
        const result = getDiscountRateFromLast(null, lastEstimate);
        expect(result).toEqual(20);
    });

    it('returns the last bill discount rate even if there is an estimate and a default value', () => {
        const lastBill = { discount_rate: 15 };
        const lastEstimate = { discount_rate: 20 };
        const result = getDiscountRateFromLast(lastBill, lastEstimate, 30);
        expect(result).toEqual(15);
    });
});
