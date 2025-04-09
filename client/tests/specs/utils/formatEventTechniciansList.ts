import formatEventTechniciansList from '@/utils/formatEventTechniciansList';
import events from '@fixtures/parsed/events';
import Period from '@/utils/period';

describe('formatEventTechniciansList', () => {
    it('returns an empty array when nothing passed', () => {
        [null, undefined, []].forEach((emptyValue: null | undefined | never[]) => {
            const result = formatEventTechniciansList(emptyValue);
            expect(result).toEqual([]);
        });
    });

    it('returns an array of all technicians with their assigned periods', () => {
        const { technicians: eventTechnicians } = events.details(1);
        const result = formatEventTechniciansList(eventTechnicians);
        expect(result.length).toBe(2);

        // - First technician with 1 assigned period
        expect(result[0].id).toStrictEqual(1);
        expect(result[0].name).toEqual('Roger Rabbit');
        expect(result[0].phone).toBeNull();
        expect(result[0].periods.length).toStrictEqual(1);

        // - First period of technician 1
        expect(result[0].periods[0].id).toStrictEqual(1);
        expect(result[0].periods[0].role?.name).toEqual('Régisseur');
        expect(result[0].periods[0].period).toBeInstanceOf(Period);

        // - Second technician with 1 assigned period
        expect(result[1].id).toStrictEqual(2);
        expect(result[1].name).toEqual('Jean Technicien');
        expect(result[1].phone).toEqual('+33645698520');
        expect(result[1].periods.length).toStrictEqual(1);

        // - First period of technician 2
        expect(result[1].periods[0].id).toStrictEqual(2);
        expect(result[1].periods[0].role?.name).toEqual('Technicien plateau');
        expect(result[1].periods[0].period).toBeInstanceOf(Period);
    });
});
