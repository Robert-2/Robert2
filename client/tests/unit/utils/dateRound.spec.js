import dateRound from '@/utils/dateRound';

describe('dateRound', () => {
    it('return a date rounded to nearest quarter (12:00)', () => {
        const date = new Date('2021-08-01T12:05:00');
        const result = dateRound(date);
        expect(result.getDate()).toEqual(1);
        expect(result.getHours()).toEqual(12);
        expect(result.getMinutes()).toEqual(0);
    });

    it('return a date rounded to nearest quarter (12:15)', () => {
        const date = new Date('2021-08-01T12:12:00');
        const result = dateRound(date);
        expect(result.getDate()).toEqual(1);
        expect(result.getHours()).toEqual(12);
        expect(result.getMinutes()).toEqual(15);
    });

    it('return a date rounded to nearest quarter (12:30)', () => {
        const date = new Date('2021-08-01T12:25:00');
        const result = dateRound(date);
        expect(result.getDate()).toEqual(1);
        expect(result.getHours()).toEqual(12);
        expect(result.getMinutes()).toEqual(30);
    });

    it('return a date rounded to nearest quarter (13:00)', () => {
        const date = new Date('2021-08-01T12:55:00');
        const result = dateRound(date);
        expect(result.getDate()).toEqual(1);
        expect(result.getHours()).toEqual(13);
        expect(result.getMinutes()).toEqual(0);
    });

    it('return a date rounded to nearest quarter (00:00 next day)', () => {
        const date = new Date('2021-08-01T23:55:00');
        const result = dateRound(date);
        expect(result.getDate()).toEqual(2);
        expect(result.getHours()).toEqual(0);
        expect(result.getMinutes()).toEqual(0);
    });

    it('return a date rounded to nearest half-hour (13:30 up)', () => {
        const date = new Date('2021-08-01T13:16:00');
        const result = dateRound(date, 30);
        expect(result.getDate()).toEqual(1);
        expect(result.getHours()).toEqual(13);
        expect(result.getMinutes()).toEqual(30);
    });

    it('return a date rounded to nearest half-hour (13:30 down)', () => {
        const date = new Date('2021-08-01T13:44:00');
        const result = dateRound(date, 30);
        expect(result.getDate()).toEqual(1);
        expect(result.getHours()).toEqual(13);
        expect(result.getMinutes()).toEqual(30);
    });

    it('return a date rounded to nearest half-hour (00:00 next day)', () => {
        const date = new Date('2021-08-01T23:48:00');
        const result = dateRound(date, 30);
        expect(result.getDate()).toEqual(2);
        expect(result.getHours()).toEqual(0);
        expect(result.getMinutes()).toEqual(0);
    });

    it('return a date rounded to nearest exact hour (14:00 up)', () => {
        const date = new Date('2021-08-01T13:31:00');
        const result = dateRound(date, 60);
        expect(result.getDate()).toEqual(1);
        expect(result.getHours()).toEqual(14);
        expect(result.getMinutes()).toEqual(0);
    });

    it('return a date rounded to nearest exact hour (14:00 down)', () => {
        const date = new Date('2021-08-01T14:28:00');
        const result = dateRound(date, 60);
        expect(result.getDate()).toEqual(1);
        expect(result.getHours()).toEqual(14);
        expect(result.getMinutes()).toEqual(0);
    });

    it('return a date rounded to nearest exact hour (00:00 next day)', () => {
        const date = new Date('2021-08-01T23:32:00');
        const result = dateRound(date, 60);
        expect(result.getDate()).toEqual(2);
        expect(result.getHours()).toEqual(0);
        expect(result.getMinutes()).toEqual(0);
    });
});
