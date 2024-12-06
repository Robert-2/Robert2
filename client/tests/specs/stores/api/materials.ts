import requester from '@/globals/requester';
import apiMaterials from '@/stores/api/materials';
import { withPaginationEnvelope } from '@fixtures/@utils';
import documents from '@fixtures/documents';
import bookings from '@fixtures/bookings';
import data from '@fixtures/materials';

describe('Materials Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            const allData = data.withAvailability();
            const paginatedData = withPaginationEnvelope(allData);

            // - Avec pagination (1).
            jest.spyOn(requester, 'get').mockResolvedValue({ data: paginatedData });
            expect(await apiMaterials.all()).toMatchSnapshot();

            // - Avec pagination (2).
            jest.spyOn(requester, 'get').mockResolvedValue({ data: paginatedData });
            expect(await apiMaterials.all({ paginated: true })).toMatchSnapshot();

            // - Sans pagination.
            jest.spyOn(requester, 'get').mockResolvedValue({ data: allData });
            expect(await apiMaterials.all({ paginated: false })).toMatchSnapshot();
        });
    });

    describe('allWhileEvent()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: data.withContext() });
            expect(await apiMaterials.allWhileEvent(1)).toMatchSnapshot();
        });
    });

    describe('one()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
            expect(await apiMaterials.one(datum.id)).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiMaterials.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiMaterials.update(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('bookings()', () => {
        it('parse the returned data correctly', async () => {
            const paginatedData = withPaginationEnvelope(
                bookings.summary().map((booking: any) => ({
                    ...booking,
                    pivot: {
                        quantity: 12,
                    },
                })),
            );
            jest.spyOn(requester, 'get').mockResolvedValue({ data: paginatedData });
            expect(await apiMaterials.bookings(1)).toMatchSnapshot();
        });
    });

    describe('documents()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: documents.default() });
            expect(await apiMaterials.documents(1)).toMatchSnapshot();
        });
    });

    describe('attachDocument()', () => {
        it.each(documents.default())('parse the returned data correctly (with document #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            const fakeFile = new File(['__TEST__'], 'my-document.txt', { type: 'text/plain' });
            expect(await apiMaterials.attachDocument(1, fakeFile)).toMatchSnapshot();
        });
    });

    describe('restore()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiMaterials.restore(datum.id)).toMatchSnapshot();
        });
    });
});
