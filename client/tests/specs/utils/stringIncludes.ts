import stringIncludes from '@/utils/stringIncludes';

describe('stringIncludes', () => {
    it('compares strings of characters and returns a boolean if they are equivalent', () => {
        // - Chaînes équivalentes.
        expect(stringIncludes('Un test', 'Un test')).toBe(true);
        expect(stringIncludes('un test', 'UN TeSt')).toBe(true);
        expect(stringIncludes('Une leçon récitée', 'Une lecon récitee')).toBe(true);

        // - Chaînes non équivalentes.
        expect(stringIncludes('A test', 'B test')).toBe(false);
        expect(stringIncludes('B test', 'A test')).toBe(false);
        expect(stringIncludes('1', '2')).toBe(false);
    });

    it('should return `false` if the sub-string is longer than the string in which we are searching', () => {
        expect(stringIncludes('Une voiture', 'Une voiture rouge')).toBe(false);
        expect(stringIncludes('Test', 'Un test')).toBe(false);
    });

    it('should return `true` if the sub-string appear in the string in which we are searching', () => {
        // - Chaînes équivalentes.
        expect(stringIncludes('Une voiture rouge', 'Une voiture')).toBe(true);
        expect(stringIncludes('Chaîne HiFi Panasonic SC-HC412EG-K', 'Chaîne hifi panasonic')).toBe(true);
        expect(stringIncludes('Chaîne HiFi Panasonic SC-HC412EG-K', 'chaine hifi')).toBe(true);

        // - Chaînes non équivalentes.
        expect(stringIncludes('Chaîne HiFi Panasonic SC-HC412EG-K', 'Chaîne HiFi Sony')).toBe(false);
    });
});
