import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import eventMaterials from './data/event-materials';

describe('getEventOneDayTotalDiscountable', () => {
  it('returns 0 with empty values', () => {
    expect(getEventOneDayTotalDiscountable()).toBe(0);
    expect(getEventOneDayTotalDiscountable(null)).toBe(0);
    expect(getEventOneDayTotalDiscountable([])).toBe(0);
  });

  it('calculates the total discountable of a set of materials for ONE day', () => {
    expect(getEventOneDayTotalDiscountable(eventMaterials)).toBe(170);
  });
});
