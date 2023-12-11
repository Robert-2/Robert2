import generateDerivedName from '../generateDerivedName';

describe('MaterialsSelector / Utils / generateDerivedName()', () => {
    it('should return a related name from a list', () => {
        // - Test simple (1).
        const result1 = generateDerivedName('Salle 1');
        expect(result1).toBe('Salle 1 (2)');

        // - Test simple (2).
        const result2 = generateDerivedName(`Salle "Eiffel" (à l'est)`);
        expect(result2).toBe(`Salle "Eiffel" (à l'est) (2)`);

        // - Test simple (3).
        const result3 = generateDerivedName(`Salle "Eiffel" (à l'est)`, ['Une autre salle']);
        expect(result3).toBe(`Salle "Eiffel" (à l'est) (2)`);
    });

    it('should reuse the existing count if it exists (without other names)', () => {
        // - Test simple (1).
        const result1 = generateDerivedName('Salle 1 (2)');
        expect(result1).toBe('Salle 1 (3)');

        // - Test simple (2).
        const result2 = generateDerivedName('Place du chateau (55)');
        expect(result2).toBe('Place du chateau (56)');

        // - Avec un compteur qui commence avant.
        const result4 = generateDerivedName('Salle 1 (0)');
        expect(result4).toBe('Salle 1 (2)');

        // - Sans texte (1).
        const result5 = generateDerivedName('(1)');
        expect(result5).toBe('(2)');

        // - Sans texte (=> Ne doit pas matcher les nombres seuls) (2).
        const result6 = generateDerivedName('1');
        expect(result6).toBe('1 (2)');
    });

    it('should reuse the existing count if it exists (with other names)', () => {
        // - Test simple.
        const result1 = generateDerivedName('Salle 1 (2)', ['Salle 1 (1)']);
        expect(result1).toBe('Salle 1 (3)');

        // - Test avec autre nom qui a un compteur supérieur (1).
        const result2 = generateDerivedName('Salle 1 (2)', ['Salle 1 (4)']);
        expect(result2).toBe('Salle 1 (5)');

        // - Test avec autre nom qui a un compteur supérieur (2).
        const result3 = generateDerivedName('Place du chateau (2)', [
            'Place du chateau (1)',
            'Place du chateau (3)',
        ]);
        expect(result3).toBe('Place du chateau (4)');

        // - Test avec autre nom avec compteur sans rapport avec le nom d'origine.
        const result4 = generateDerivedName('Place du chateau (1)', ['Salle 1 (4)']);
        expect(result4).toBe('Place du chateau (2)');

        // - Test avec autre nom avec compteur et pas de compteur dans le nom d'origine.
        const result5 = generateDerivedName('Place du chateau', ['Place du chateau (6)']);
        expect(result5).toBe('Place du chateau (7)');

        // - Test complexe.
        const result6 = generateDerivedName('Place du chateau (2)', [
            'Place du chateau (1)',
            'Salle 1 (1)',
            'Salle 1 (2)',
            'Place du chateau (3)',
            'Salle 1 (3)',
            'Salle 1 (4)',
        ]);
        expect(result6).toBe('Place du chateau (4)');
    });
});
