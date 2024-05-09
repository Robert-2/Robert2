import requester from '@/globals/requester';
import apiBeneficiaries from '@/stores/api/beneficiaries';
import { withPaginationEnvelope } from '@fixtures/@utils';
import estimates from '@fixtures/estimates';
import invoices from '@fixtures/invoices';
import bookings from '@fixtures/bookings';
import data from '@fixtures/beneficiaries';

describe('Beneficiaries Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            const paginatedData = withPaginationEnvelope(data.default());
            jest.spyOn(requester, 'get').mockResolvedValue({ data: paginatedData });
            expect(await apiBeneficiaries.all()).toMatchSnapshot();
        });
    });

    describe('one()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
            expect(await apiBeneficiaries.one(datum.id)).toMatchSnapshot();
        });
    });

    describe('bookings()', () => {
        it('parse the returned data correctly', async () => {
            const paginatedData = withPaginationEnvelope(bookings.excerpt());
            jest.spyOn(requester, 'get').mockResolvedValue({ data: paginatedData });
            expect(await apiBeneficiaries.bookings(1)).toMatchSnapshot();
        });
    });

    describe('estimates()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: estimates.default() });
            expect(await apiBeneficiaries.estimates(1)).toMatchSnapshot();
        });
    });

    describe('invoices()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: invoices.default() });
            expect(await apiBeneficiaries.invoices(1)).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiBeneficiaries.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiBeneficiaries.update(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('restore()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiBeneficiaries.restore(datum.id)).toMatchSnapshot();
        });
    });
});
