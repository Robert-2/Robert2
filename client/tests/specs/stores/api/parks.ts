import requester from '@/globals/requester';
import apiParks from '@/stores/api/parks';
import materials from '@fixtures/materials';
import { withPaginationEnvelope } from '@fixtures/@utils';
import data from '@fixtures/parks';
import Decimal from 'decimal.js';

describe('Parks Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            const paginatedData = withPaginationEnvelope(data.default());
            jest.spyOn(requester, 'get').mockResolvedValue({ data: paginatedData });
            expect(await apiParks.all()).toMatchSnapshot();
        });
    });

    describe('list()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: data.summary() });
            expect(await apiParks.list()).toMatchSnapshot();
        });
    });

    describe('one()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
            expect(await apiParks.one(datum.id)).toMatchSnapshot();
        });
    });

    describe('oneTotalAmount()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: '119_061.80' });

            const result = await apiParks.oneTotalAmount(1);
            expect(result).toBeInstanceOf(Decimal);
            expect(result.toString()).toBe('119061.8');
        });
    });

    describe('materials()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: materials.default() });
            expect(await apiParks.materials(1)).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiParks.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiParks.update(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('restore()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiParks.restore(datum.id)).toMatchSnapshot();
        });
    });
});
