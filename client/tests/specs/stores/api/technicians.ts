import requester from '@/globals/requester';
import apiTechnicians from '@/stores/api/technicians';
import { withPaginationEnvelope } from '@fixtures/@utils';
import documents from '@fixtures/documents';
import data from '@fixtures/technicians';

describe('Technicians Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            const paginatedData = withPaginationEnvelope(data.default());
            jest.spyOn(requester, 'get').mockResolvedValue({ data: paginatedData });
            expect(await apiTechnicians.all()).toMatchSnapshot();
        });
    });

    describe('allWhileEvent()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: data.withEvents() });
            expect(await apiTechnicians.allWhileEvent(1)).toMatchSnapshot();
        });
    });

    describe('one()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
            expect(await apiTechnicians.one(datum.id)).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiTechnicians.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiTechnicians.update(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('documents()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: documents.default() });
            expect(await apiTechnicians.documents(1)).toMatchSnapshot();
        });
    });

    describe('assignments()', () => {
        it.each(data.withEvents())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: datum.events });
            expect(await apiTechnicians.assignments(datum.id)).toMatchSnapshot();
        });
    });

    describe('attachDocument()', () => {
        it.each(documents.default())('parse the returned data correctly (with document #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            const fakeFile = new File(['__TEST__'], 'my-document.txt', { type: 'text/plain' });
            expect(await apiTechnicians.attachDocument(1, fakeFile)).toMatchSnapshot();
        });
    });

    describe('restore()', () => {
        it.each(data.default())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiTechnicians.restore(datum.id)).toMatchSnapshot();
        });
    });
});
