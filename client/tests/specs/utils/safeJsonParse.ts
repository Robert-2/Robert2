import safeJsonParse from '@/utils/safeJsonParse';

describe('safeJsonParse', () => {
    it('parse valid JSON and return the value', () => {
        expect(safeJsonParse('{"foo":"bar"}')).toStrictEqual({ foo: 'bar' });
        expect(safeJsonParse('5')).toBe(5);
        expect(safeJsonParse('true')).toBe(true);
    });

    it('should not throw and exception when an invalid JSON is passed but rather return `undefined`', () => {
        const doTest = (): unknown => safeJsonParse('{');
        expect(doTest).not.toThrow();
        expect(doTest()).toBeUndefined();
    });
});
