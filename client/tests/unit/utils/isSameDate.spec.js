import isSameDate from '@/utils/isSameDate';

describe('isSameDate', () => {
  it('Returns true when values are strictly equal', () => {
    expect(isSameDate(null, null)).toBe(true);
    expect(isSameDate(null, '')).toBe(false);
    expect(isSameDate(123, 123)).toBe(true);
  });

  it('Returns true when dates strings are equivalent', () => {
    expect(isSameDate('2021-03-08', '2021-03-08')).toBe(true);
  });

  it('Returns false when dates strings are not equivalent', () => {
    expect(isSameDate('2021-03-08', '2021-03-09')).toBe(false);
  });

  it('Returns true when dates objects are the same day', () => {
    const date1 = new Date('2020-03-08T12:00:00Z');
    const date2 = new Date('2020-03-08T12:00:00Z');
    expect(isSameDate(date1, date2)).toBe(true);
  });

  it('Returns true when dates objects are the same day but not same hour', () => {
    const date1 = new Date('2020-03-08T12:00:00Z');
    const date2 = new Date('2020-03-08T18:00:00Z');
    expect(isSameDate(date1, date2)).toBe(true);
  });

  it('Returns false when dates objects are not the same day', () => {
    const date1 = new Date('2020-03-08T12:00:00Z');
    const date2 = new Date('2020-03-09T12:00:00Z');
    expect(isSameDate(date1, date2)).toBe(false);
  });

  it('Returns true when dates are mixed string/object but the same day', () => {
    const date1 = new Date('2020-03-08T12:00:00Z');
    expect(isSameDate(date1, '2020-03-08T18:00:00Z')).toBe(true);
  });

  it('Returns false when dates are mixed string/object but not the same day', () => {
    const date2 = new Date('2020-03-09T12:00:00Z');
    expect(isSameDate('2020-03-08T18:00:00Z', date2)).toBe(false);
  });
});
