import getEventGrandTotal from '@/utils/getEventGrandTotal';

describe('getEventGrandTotal', () => {
  it('returns 0 with empty values', () => {
    expect(getEventGrandTotal('notAnumber', 1)).toBe(0);
    expect(getEventGrandTotal(null, 1)).toBe(0);
    expect(getEventGrandTotal(0, 1)).toBe(0);
    expect(getEventGrandTotal(40, 0)).toBe(0);
  });

  it('calculates the grand total for an event, given its duration and ratio', () => {
    const dailyTotal = 297;
    // - For one day
    expect(getEventGrandTotal(dailyTotal, 1)).toBe(297);
    // - For two days (40 × 1.75)
    expect(getEventGrandTotal(dailyTotal, 2)).toBe(519.75);
    // - For four days (40 × 3.25)
    expect(getEventGrandTotal(dailyTotal, 4)).toBe(965.25);
  });
});
