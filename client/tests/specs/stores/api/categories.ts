import requester from '@/globals/requester';
import apiCategories from '@/stores/api/categories';
import data from '@fixtures/categories';

describe('Categories Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: data.details() });
            expect(await apiCategories.all()).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiCategories.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiCategories.update(datum.id, {} as any)).toMatchSnapshot();
        });
    });
});
