import { round, floor } from '@/utils/decimalRound';

describe('decimalRound', () => {
    describe('round()', () => {
        it('return the value rounded to 2 decimals', () => {
            expect(round(1)).toEqual(1);
            expect(round(1.1)).toEqual(1.1);
            expect(round(1.008)).toEqual(1.01);
            expect(round(1.014)).toEqual(1.01);
            expect(round(1.015)).toEqual(1.02);
            expect(round(1.0001)).toEqual(1);
        });

        it('return the value rounded to 4 decimals', () => {
            expect(round(1, 4)).toEqual(1);
            expect(round(1.1, 4)).toEqual(1.1);
            expect(round(1.0001, 4)).toEqual(1.0001);
            expect(round(1.00008, 4)).toEqual(1.0001);
        });

        it('return 0 if value is falsy', () => {
            expect(round(null)).toEqual(0);
            expect(round(false)).toEqual(0);
        });

        it('return NaN if value is not a number', () => {
            expect(round('NotANumber')).toEqual(NaN);
            expect(round({ a: 1 })).toEqual(NaN);
        });
    });

    describe('floor()', () => {
        it('return the value rounded to 2 decimals', () => {
            expect(floor(1)).toEqual(1);
            expect(floor(1.1)).toEqual(1.1);
            expect(floor(1.008)).toEqual(1);
            expect(floor(1.014)).toEqual(1.01);
            expect(floor(1.015)).toEqual(1.01);
            expect(floor(1.0001)).toEqual(1);
        });

        it('return the value rounded to 4 decimals', () => {
            expect(floor(1, 4)).toEqual(1);
            expect(floor(1.1, 4)).toEqual(1.1);
            expect(floor(1.0001, 4)).toEqual(1.0001);
            expect(floor(1.00008, 4)).toEqual(1);
        });

        it('return 0 if value is falsy', () => {
            expect(floor(null)).toEqual(0);
            expect(floor(false)).toEqual(0);
        });

        it('return NaN if value is not a number', () => {
            expect(floor('NotANumber')).toEqual(NaN);
            expect(floor({ a: 1 })).toEqual(NaN);
        });
    });
});
