import requester from '@/globals/requester';
import apiTaxes from '@/stores/api/taxes';
import data from '@fixtures/taxes';

describe('Taxes Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: data.default() });
            expect(await apiTaxes.all()).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiTaxes.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiTaxes.update(datum.id, {} as any)).toMatchSnapshot();
        });
    });
});
