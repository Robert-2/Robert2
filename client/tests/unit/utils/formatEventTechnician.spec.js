import moment from 'moment';
import formatEventTechnician from '@/utils/formatEventTechnician';
import eventTechniciansData from '@fixtures/event-technicians';

describe('formatEventTechnician', () => {
    it('returns null when nothing passed', () => {
        [null, undefined].forEach((emptyValue) => {
            const result = formatEventTechnician(emptyValue);
            expect(result).toBeNull();
        });
    });

    it('returns an object with formatted data of the event-technician', () => {
        const result = formatEventTechnician(eventTechniciansData[0]);
        expect(moment.isMoment(result.start)).toBe(true);
        expect(result.start.format('DD MMM LT')).toEqual('26 Jul 8:00 AM');
        expect(moment.isMoment(result.end)).toBe(true);
        expect(result.end.format('DD MMM LT')).toEqual('26 Jul 7:30 PM');
        expect(result.content).toEqual('8:00 AM ⇒ 7:30 PM : Testeur');
        expect(result.title).toEqual('Test event (Testville)\n8:00 AM ⇒ 7:30 PM : Testeur');
    });
});
