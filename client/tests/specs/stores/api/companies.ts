import requester from '@/globals/requester';
import apiCompanies from '@/stores/api/companies';
import { withPaginationEnvelope } from '@fixtures/@utils';
import data from '@fixtures/companies';

describe('Companies Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            const paginatedData = withPaginationEnvelope(data.default());
            jest.spyOn(requester, 'get').mockResolvedValue({ data: paginatedData });
            expect(await apiCompanies.all()).toMatchSnapshot();
        });
    });

    describe('one()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
            expect(await apiCompanies.one(datum.id)).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiCompanies.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiCompanies.update(datum.id, {} as any)).toMatchSnapshot();
        });
    });
});
