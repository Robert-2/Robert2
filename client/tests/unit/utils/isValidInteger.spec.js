import isValidInteger from '@/utils/isValidInteger';

describe('isValidInteger', () => {
    it('returns true when value is a valid integer', () => {
        expect(isValidInteger(1)).toBe(true);
        expect(isValidInteger(-55555)).toBe(true);
        expect(isValidInteger('10')).toBe(true);
        expect(isValidInteger('10546')).toBe(true);
        expect(isValidInteger('-10')).toBe(true);
    });

    it('returns false when value is not a valid integer', () => {
        expect(isValidInteger(10.5)).toBe(false);
        expect(isValidInteger(-10.5)).toBe(false);
        expect(isValidInteger('10.65')).toBe(false);
        expect(isValidInteger('foo 10')).toBe(false);
        expect(isValidInteger('Infinity')).toBe(false);
        expect(isValidInteger(Infinity)).toBe(false);
        expect(isValidInteger('10 546')).toBe(false);
    });
});
