import requester from '@/globals/requester';
import apiDegressiveRates from '@/stores/api/degressive-rates';
import data from '@fixtures/degressive-rates';

describe('Degressive Rates Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: data.default() });
            expect(await apiDegressiveRates.all()).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiDegressiveRates.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiDegressiveRates.update(datum.id, {} as any)).toMatchSnapshot();
        });
    });
});
