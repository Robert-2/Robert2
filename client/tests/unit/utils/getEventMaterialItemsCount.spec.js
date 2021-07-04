import getEventMaterialItemsCount from '@/utils/getEventMaterialItemsCount';
import eventMaterials from './data/event-materials';

describe('getEventMaterialItemsCount', () => {
  it('returns 0 with empty values', () => {
    expect(getEventMaterialItemsCount()).toBe(0);
    expect(getEventMaterialItemsCount(null)).toBe(0);
    expect(getEventMaterialItemsCount([])).toBe(0);
  });

  it('calculates the total count of items in a set of materials', () => {
    expect(getEventMaterialItemsCount(eventMaterials)).toBe(7);
  });
});
