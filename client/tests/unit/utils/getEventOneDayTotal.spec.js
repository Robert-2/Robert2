import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import eventMaterials from '@fixtures/event-materials';

describe('getEventOneDayTotal', () => {
    it('returns 0 with empty values', () => {
        expect(getEventOneDayTotal()).toBe(0);
        expect(getEventOneDayTotal(null)).toBe(0);
        expect(getEventOneDayTotal([])).toBe(0);
    });

    it('calculates the total of a set of materials for ONE day', () => {
        expect(getEventOneDayTotal(eventMaterials)).toBe(80);
    });
});
