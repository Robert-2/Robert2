import eventMaterials from '@fixtures/event-materials';
import getMaterialUnitPrice from '../getMaterialUnitPrice';

describe('getMaterialUnitPrice', () => {
    it('returns an event material unit price', () => {
        const result = getMaterialUnitPrice(eventMaterials[4]);
        expect(result).toEqual(45);
    });
});
