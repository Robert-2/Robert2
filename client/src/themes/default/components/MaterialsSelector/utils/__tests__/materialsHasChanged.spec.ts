import materialsHasChanged from '../materialsHasChanged';

describe('MaterialsSelector / Utils / materialsHasChanged()', () => {
    it('should return true if the quantity of a previously saved material has changed', () => {
        // - Test simple de changement de quantité.
        const before1 = [{ id: 1, quantity: 1, units: [] }];
        const after1 = [{ id: 1, quantity: 2, units: [] }];
        expect(materialsHasChanged(before1, after1)).toBe(true);

        // - Test de suppression
        const before5 = [{ id: 1, quantity: 1, units: [] }];
        expect(materialsHasChanged(before5, [])).toBe(true);

        // - Test avec plusieurs matériels.
        const before6 = [
            { id: 1, quantity: 1, units: [] },
            { id: 2, quantity: 1, units: [] },
        ];
        const after6 = [
            { id: 1, quantity: 1, units: [] },
            { id: 2, quantity: 3, units: [1] },
        ];
        expect(materialsHasChanged(before6, after6)).toBe(true);
    });

    it('should return true if a new material has been added', () => {
        const after = [{ id: 1, quantity: 1, units: [] }];
        expect(materialsHasChanged([], after)).toBe(true);
    });

    it('should return false if a material has been added with a quantity of 0', () => {
        const after = [{ id: 1, quantity: 0, units: [] }];
        expect(materialsHasChanged([], after)).toBe(false);
    });

    it('should return false if a previously saved material has not changed', () => {
        // - Test simple de changement de quantité.
        const before1 = [{ id: 1, quantity: 1, units: [] }];
        const after1 = [{ id: 1, quantity: 1, units: [] }];
        expect(materialsHasChanged(before1, after1)).toBe(false);

        // - Test avec plusieurs matériels.
        const before4 = [
            { id: 1, quantity: 1, units: [] },
            { id: 2, quantity: 1, units: [1, 2] },
        ];
        const after4 = [
            { id: 1, quantity: 1, units: [] },
            { id: 2, quantity: 1, units: [1, 2] },
        ];
        expect(materialsHasChanged(before4, after4)).toBe(false);
    });
});
