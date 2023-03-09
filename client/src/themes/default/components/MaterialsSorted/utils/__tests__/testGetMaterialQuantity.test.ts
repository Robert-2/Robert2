import eventMaterials from '@fixtures/event-materials';
import getMaterialQuantity from '../getMaterialQuantity';

describe('getMaterialQuantity', () => {
    it('returns an event material quantity', () => {
        const result = getMaterialQuantity(eventMaterials[4]);
        expect(result).toEqual(3);
    });
});
