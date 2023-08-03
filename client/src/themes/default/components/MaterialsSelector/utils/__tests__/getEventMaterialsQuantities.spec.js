import getEventMaterialsQuantities from '../getEventMaterialsQuantities';

describe('MaterialsSelector / Utils / getEventMaterialsQuantities()', () => {
    it('should return an object containing the quantities related to an event material', () => {
        const materials = [
            { id: 1, is_unitary: false, pivot: { quantity: 2 } },
            { id: 2, is_unitary: false, pivot: { quantity: 6 } },
            { id: 3, is_unitary: false, pivot: { quantity: 0 } },
            { id: 4, is_unitary: false },
            { id: 5, is_unitary: false },
            { id: 6, is_unitary: false, pivot: { quantity: 0 } },
            { id: 7, is_unitary: false, pivot: { quantity: 2 } },
        ];
        expect(getEventMaterialsQuantities(materials)).toEqual([
            { id: 1, quantity: 2 },
            { id: 2, quantity: 6 },
            { id: 3, quantity: 0 },
            { id: 4, quantity: 0 },
            { id: 5, quantity: 0 },
            { id: 6, quantity: 0 },
            { id: 7, quantity: 2 },
        ]);
    });
});
