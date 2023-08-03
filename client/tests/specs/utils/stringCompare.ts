import stringCompare from '@/utils/stringCompare';

describe('stringCompare', () => {
    it('compare two string using runtime locale', () => {
        // - Chaînes équivalentes.
        expect(stringCompare('Un test', 'Un test')).toBe(0);
        expect(stringCompare('un test', 'UN TeSt')).toBe(0);
        expect(stringCompare('Une leçon récitée', 'Une lecon récitee')).toBe(0);

        // - Chaîne `a` avant `b`.
        expect(stringCompare('A test', 'B test')).toBe(-1);
        expect(stringCompare('a test', 'B test')).toBe(-1);
        expect(stringCompare(`! Avec : "ponctuation" ? Yes.`, `Sans ponctuation ? No.`)).toBe(-1);
        expect(stringCompare('1', '20')).toBe(-1);

        // - Chaîne `b` avant `a`.
        expect(stringCompare('B test', 'A test')).toBe(1);
        expect(stringCompare('b test', 'A test')).toBe(1);
        expect(stringCompare('10', '2')).toBe(1);
    });
});
