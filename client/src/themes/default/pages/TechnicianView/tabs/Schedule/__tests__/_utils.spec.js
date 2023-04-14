import moment from 'moment';
import technicianEventsData from '@fixtures/technician-events';
import { formatTechnicianEvent } from '../_utils';

describe('TechnicianView/Schedule/utils.formatTechnicianEvent', () => {
    test('returns data of event formatted for calendar of technicians, with title and classes', () => {
        const result = formatTechnicianEvent(technicianEventsData[0]);
        expect(result).toBeDefined();

        expect(result.id).toBe(1);
        expect(result.eventId).toBe(2);
        expect(moment.isMoment(result.startDate)).toBe(true);
        expect(result.startDate.format('DD MMM LT')).toEqual('01 Oct 8:00 AM');
        expect(moment.isMoment(result.endDate)).toBe(true);
        expect(result.endDate.format('DD MMM LT')).toEqual('02 Oct 11:00 PM');
        expect(result.title).toEqual('Test event (Testville)\n01 October, 8:00 AM ⇒ 02 October, 11:00 PM : Régisseur');
        expect(result.classes).toEqual(['cv-item--past', 'cv-item--not-confirmed']);
    });

    test('checks that midnight end time is offset to previous second', () => {
        const data = technicianEventsData[0];
        data.end_time = '2019-10-03 00:00:00';
        const result = formatTechnicianEvent(technicianEventsData[0]);
        expect(result.endDate.format('DD/MM/YYYY HH:mm:ss')).toEqual('02/10/2019 23:59:59');
    });
});
