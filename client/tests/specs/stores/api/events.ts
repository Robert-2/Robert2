import requester from '@/globals/requester';
import apiEvents from '@/stores/api/events';
import documents from '@fixtures/documents';
import invoices from '@fixtures/invoices';
import estimates from '@fixtures/estimates';
import materials from '@fixtures/materials';
import data from '@fixtures/events';
import { withCountedEnvelope } from '@fixtures/@utils';

describe('Events Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            const countedData = withCountedEnvelope(data.summary());
            jest.spyOn(requester, 'get').mockResolvedValue({ data: countedData });
            expect(await apiEvents.all()).toMatchSnapshot();
        });
    });

    describe('one()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
            expect(await apiEvents.one(datum.id)).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiEvents.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiEvents.update(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('setConfirmed()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiEvents.setConfirmed(datum.id, true)).toMatchSnapshot();
        });
    });

    describe('archive()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiEvents.archive(datum.id)).toMatchSnapshot();
        });
    });

    describe('unarchive()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiEvents.unarchive(datum.id)).toMatchSnapshot();
        });
    });

    describe('updateDepartureInventory()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiEvents.updateDepartureInventory(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('finishDepartureInventory()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiEvents.finishDepartureInventory(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('cancelDepartureInventory()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'delete').mockResolvedValue({ data: datum });
            expect(await apiEvents.cancelDepartureInventory(datum.id)).toMatchSnapshot();
        });
    });

    describe('updateReturnInventory()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiEvents.updateReturnInventory(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('finishReturnInventory()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiEvents.finishReturnInventory(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('cancelReturnInventory()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'delete').mockResolvedValue({ data: datum });
            expect(await apiEvents.cancelReturnInventory(datum.id)).toMatchSnapshot();
        });
    });

    describe('getTechnicianAssignment()', () => {
        const _data = data.details().flatMap((event: any) => event.technicians);
        it.each(_data)('parse the returned data correctly (with technician assignment #$id)', async (datum: any) => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
            expect(await apiEvents.getTechnicianAssignment(datum.id)).toMatchSnapshot();
        });
    });

    describe('addTechnicianAssignment()', () => {
        const _data = data.details().flatMap((event: any) => event.technicians);
        it.each(_data)('parse the returned data correctly (with technician assignment #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiEvents.addTechnicianAssignment(datum.event_id, datum.technician_id, {} as any)).toMatchSnapshot();
        });
    });

    describe('updateTechnicianAssignment()', () => {
        const _data = data.details().flatMap((event: any) => event.technicians);
        it.each(_data)('parse the returned data correctly (with technician assignment #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiEvents.updateTechnicianAssignment(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('duplicate()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiEvents.duplicate(datum.id, {} as any)).toMatchSnapshot();
        });
    });

    describe('documents()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: documents.default() });
            expect(await apiEvents.documents(1)).toMatchSnapshot();
        });
    });

    describe('createInvoice()', () => {
        it.each(invoices.default())('parse the returned data correctly (with invoice #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiEvents.createInvoice(1)).toMatchSnapshot();
        });
    });

    describe('createEstimate()', () => {
        it.each(estimates.default())('parse the returned data correctly (with invoice #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiEvents.createEstimate(1)).toMatchSnapshot();
        });
    });

    describe('attachDocument()', () => {
        it.each(documents.default())('parse the returned data correctly (with document #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            const fakeFile = new File(['__TEST__'], 'my-document.txt', { type: 'text/plain' });
            expect(await apiEvents.attachDocument(1, fakeFile)).toMatchSnapshot();
        });
    });

    describe('missingMaterials()', () => {
        it('parse the returned data correctly', async () => {
            const _data = [
                {
                    id: 6,
                    name: `Behringer X Air XR18`,
                    reference: 'XR18',
                    category_id: 1,
                    quantity: 2,
                    quantity_departed: 1,
                    quantity_returned: 1,
                    quantity_returned_broken: 0,
                    quantity_missing: 1,
                    departure_comment: null,
                    unit_replacement_price: '49.99',
                    total_replacement_price: '99.98',
                    material: {
                        ...materials.withContextExcerpt(6),
                        degressive_rate: '30.93',
                        rental_price_period: '1546.19',
                    },
                },
                {
                    id: 7,
                    name: `Voiture 1`,
                    reference: 'V-1',
                    category_id: 3,
                    quantity: 3,
                    quantity_departed: null,
                    quantity_returned: 0,
                    quantity_returned_broken: 0,
                    quantity_missing: 2,
                    departure_comment: null,
                    unit_replacement_price: '32000.00',
                    total_replacement_price: '96000.00',
                    material: {
                        ...materials.withContextExcerpt(7),
                        degressive_rate: '30.75',
                        rental_price_period: '9225.00',
                    },
                },
            ];
            jest.spyOn(requester, 'get').mockResolvedValue({ data: _data });
            expect(await apiEvents.missingMaterials(4)).toMatchSnapshot();
        });
    });
});
