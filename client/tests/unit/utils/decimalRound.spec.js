import decimalRound from '@/utils/decimalRound';

describe('decimalRound', () => {
  it('return the value rounded to 2 decimals', () => {
    expect(decimalRound(1)).toEqual(1);
    expect(decimalRound(1.1)).toEqual(1.1);
    expect(decimalRound(1.008)).toEqual(1.01);
    expect(decimalRound(1.014)).toEqual(1.01);
    expect(decimalRound(1.015)).toEqual(1.02);
    expect(decimalRound(1.0001)).toEqual(1);
  });

  it('return the value rounded to 4 decimals', () => {
    expect(decimalRound(1, 4)).toEqual(1);
    expect(decimalRound(1.1, 4)).toEqual(1.1);
    expect(decimalRound(1.0001, 4)).toEqual(1.0001);
    expect(decimalRound(1.00008, 4)).toEqual(1.0001);
  });

  it('return 0 if value is falsy', () => {
    expect(decimalRound(null)).toEqual(0);
    expect(decimalRound(false)).toEqual(0);
  });

  it('return NaN if value is not a number', () => {
    expect(decimalRound('NotANumber')).toEqual(NaN);
    expect(decimalRound({ a: 1 })).toEqual(NaN);
  });
});
