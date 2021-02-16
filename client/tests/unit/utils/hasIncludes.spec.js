import hasIncludes from '@/utils/hasIncludes';

describe('hasIncludes', () => {
  it('returns true when value is present in one of the search strings', () => {
    const searches = ['test', 'something'];
    const result = hasIncludes('A string to be tested', searches);
    expect(result).toBe(true);
  });

  it('returns false when none of the search strings are found in value', () => {
    const searches = ['test', 'something'];
    const result = hasIncludes('A simple string', searches);
    expect(result).toBe(false);
  });
});
