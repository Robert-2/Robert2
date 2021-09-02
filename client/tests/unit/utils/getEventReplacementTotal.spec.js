import getEventReplacementTotal from '@/utils/getEventReplacementTotal';
import eventMaterials from './data/event-materials';

describe('getEventReplacementTotal', () => {
    it('returns 0 with empty values', () => {
        expect(getEventReplacementTotal()).toBe(0);
        expect(getEventReplacementTotal(null)).toBe(0);
        expect(getEventReplacementTotal([])).toBe(0);
    });

    it('calculates the total replacement price of the material for ONE day', () => {
        expect(getEventReplacementTotal(eventMaterials)).toBe(3300);
    });
});
