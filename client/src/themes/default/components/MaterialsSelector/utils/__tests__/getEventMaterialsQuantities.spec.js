import getEventMaterialsQuantities from '../getEventMaterialsQuantities';

describe('MaterialsSelector / Utils / getEventMaterialsQuantities()', () => {
    it('should return an object containing the quantities related to an event material', () => {
        const materials = [
            { id: 1, pivot: { quantity: 2 } },
            { id: 2, pivot: { quantity: 6 } },
            { id: 3, pivot: { quantity: 0 } },
            { id: 4 },
            { id: 5 },
            { id: 6, pivot: { quantity: 0 } },
            { id: 7, pivot: { quantity: 2 } },
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
