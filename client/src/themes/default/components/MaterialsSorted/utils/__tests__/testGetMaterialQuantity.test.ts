import events from '@fixtures/parsed/events';
import getMaterialQuantity from '../getMaterialQuantity';

describe('getMaterialQuantity', () => {
    it('returns an event material quantity', () => {
        const eventMaterials = events.details(1).materials;
        expect(getMaterialQuantity(eventMaterials[0])).toEqual(1);
        expect(getMaterialQuantity(eventMaterials[1])).toEqual(1);
        expect(getMaterialQuantity(eventMaterials[2])).toEqual(1);
    });
});
