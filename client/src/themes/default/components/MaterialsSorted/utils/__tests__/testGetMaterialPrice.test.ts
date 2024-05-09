import events from '@fixtures/parsed/events';
import getMaterialUnitPrice from '../getMaterialUnitPrice';
import Decimal from 'decimal.js';

describe('getMaterialUnitPrice', () => {
    it('returns an event material unit price', () => {
        const event = events.details(1);
        const result = getMaterialUnitPrice(event.materials[0]);
        expect(result).toBeInstanceOf(Decimal);
        expect(result.toString()).toEqual('300');
    });
});
