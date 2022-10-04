import moment from 'moment';
import formatEventTechniciansList from '@/utils/formatEventTechniciansList';
import eventTechniciansData from '@fixtures/event-technicians';

describe('formatEventTechniciansList', () => {
    it('returns an empty array when nothing passed', () => {
        [null, undefined, []].forEach((emptyValue) => {
            const result = formatEventTechniciansList(emptyValue);
            expect(result).toEqual([]);
        });
    });

    it('returns an array of all technicians with their assigned periods', () => {
        const result = formatEventTechniciansList(eventTechniciansData);
        expect(result.length).toBe(2);

        // - First technician with 2 assigned periods
        expect(result[0].id).toStrictEqual(1);
        expect(result[0].name).toEqual('Jean Testing');
        expect(result[0].phone).toEqual('0123456789');
        expect(result[0].periods.length).toStrictEqual(2);
        // - First period of technician 1
        expect(result[0].periods[0].id).toStrictEqual(1);
        expect(result[0].periods[0].position).toEqual('Testeur');
        expect(moment.isMoment(result[0].periods[0].from)).toBe(true);
        expect(result[0].periods[0].from.format('DD MMM LT')).toEqual('26 Jul 8:00 AM');
        expect(moment.isMoment(result[0].periods[0].to)).toBe(true);
        expect(result[0].periods[0].to.format('DD MMM LT')).toEqual('26 Jul 7:30 PM');
        // - Second period of technician 1
        expect(result[0].periods[1].id).toStrictEqual(2);
        expect(result[0].periods[1].position).toEqual('Testeur');
        expect(moment.isMoment(result[0].periods[1].from)).toBe(true);
        expect(result[0].periods[1].from.format('DD MMM LT')).toEqual('27 Jul 3:00 PM');
        expect(moment.isMoment(result[0].periods[1].to)).toBe(true);
        expect(result[0].periods[1].to.format('DD MMM LT')).toEqual('27 Jul 9:00 PM');

        // - Second technician with 1 assigned period
        expect(result[1].id).toStrictEqual(2);
        expect(result[1].name).toEqual('Louis Testing');
        expect(result[1].phone).toEqual('0987654321');
        expect(result[1].periods.length).toStrictEqual(1);
        // - First period of technician 2
        expect(result[1].periods[0].id).toStrictEqual(3);
        expect(result[1].periods[0].position).toEqual('Gardien de nuit');
        expect(moment.isMoment(result[1].periods[0].from)).toBe(true);
        expect(result[1].periods[0].from.format('DD MMM LT')).toEqual('26 Jul 7:00 PM');
        expect(moment.isMoment(result[1].periods[0].to)).toBe(true);
        expect(result[1].periods[0].to.format('DD MMM LT')).toEqual('27 Jul 3:30 PM');
    });
});
