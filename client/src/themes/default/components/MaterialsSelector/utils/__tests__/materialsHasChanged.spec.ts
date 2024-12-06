import hasQuantitiesChanged from '../hasQuantitiesChanged';

describe('MaterialsSelector / Utils / hasQuantitiesChanged()', () => {
    it('should return true if the quantity of a previously saved material has changed', () => {
        // - Test simple de changement de quantité.
        const before1 = [{ id: 1, quantity: 1 }];
        const after1 = [{ id: 1, quantity: 2 }];
        expect(hasQuantitiesChanged(before1, after1)).toBe(true);

        // - Test de suppression
        const before5 = [{ id: 1, quantity: 1 }];
        expect(hasQuantitiesChanged(before5, [])).toBe(true);

        // - Test avec plusieurs matériels.
        const before6 = [
            { id: 1, quantity: 1 },
            { id: 2, quantity: 1 },
        ];
        const after6 = [
            { id: 1, quantity: 1 },
            { id: 2, quantity: 3 },
        ];
        expect(hasQuantitiesChanged(before6, after6)).toBe(true);
    });

    it('should return true if a new material has been added', () => {
        const after = [{ id: 1, quantity: 1 }];
        expect(hasQuantitiesChanged([], after)).toBe(true);
    });

    it('should return false if a material has been added with a quantity of 0', () => {
        const after = [{ id: 1, quantity: 0 }];
        expect(hasQuantitiesChanged([], after)).toBe(false);
    });

    it('should return false if a previously saved material has not changed', () => {
        // - Test simple de changement de quantité.
        const before1 = [{ id: 1, quantity: 1 }];
        const after1 = [{ id: 1, quantity: 1 }];
        expect(hasQuantitiesChanged(before1, after1)).toBe(false);

        // - Test avec plusieurs matériels.
        const before4 = [
            { id: 1, quantity: 1 },
            { id: 2, quantity: 1 },
        ];
        const after4 = [
            { id: 1, quantity: 1 },
            { id: 2, quantity: 1 },
        ];
        expect(hasQuantitiesChanged(before4, after4)).toBe(false);
    });
});
