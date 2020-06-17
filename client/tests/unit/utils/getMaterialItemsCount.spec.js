import getMaterialItemsCount from '@/utils/getMaterialItemsCount';
import materials from './data/materials';

describe('getMaterialItemsCount', () => {
  it('returns 0 with empty values', () => {
    expect(getMaterialItemsCount()).toBe(0);
    expect(getMaterialItemsCount(null)).toBe(0);
    expect(getMaterialItemsCount([])).toBe(0);
  });

  it('calculates the total count of items in a set of materials', () => {
    expect(getMaterialItemsCount(materials)).toBe(7);
  });
});
