import requester from '@/globals/requester';
import apiUsers from '@/stores/api/users';
import { withPaginationEnvelope } from '@fixtures/@utils';
import data from '@fixtures/users';

describe('Users Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            const paginatedData = withPaginationEnvelope(data.default());
            jest.spyOn(requester, 'get').mockResolvedValue({ data: paginatedData });
            expect(await apiUsers.all()).toMatchSnapshot();
        });
    });

    describe('one()', () => {
        it('parse the returned data correctly', async () => {
            // - Avec lui-même.
            jest.spyOn(requester, 'get').mockResolvedValue({ data: data.details(1) });
            expect(await apiUsers.one('self')).toMatchSnapshot();

            // - Avec les autres utilisateurs.
            await Promise.all(
                data.details().map(async (datum: any) => {
                    jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
                    expect(await apiUsers.one(datum.id)).toMatchSnapshot();
                }),
            );
        });
    });

    describe('create()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({ data: datum });
            expect(await apiUsers.create({} as any)).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: data.details(1) });
            expect(await apiUsers.update('self', {} as any)).toMatchSnapshot();

            // - Avec les autres utilisateurs.
            await Promise.all(
                data.details().map(async (datum: any) => {
                    if (datum.id === 1) {
                        return;
                    }

                    jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
                    expect(await apiUsers.update(datum.id, {} as any)).toMatchSnapshot();
                }),
            );
        });
    });

    describe('getSettings()', () => {
        it('parse the returned data correctly', async () => {
            // - Avec lui-même.
            jest.spyOn(requester, 'get').mockResolvedValue({ data: data.settings(1) });
            expect(await apiUsers.getSettings('self')).toMatchSnapshot();

            // - Avec les autres utilisateurs.
            await Promise.all(
                data.settings().map(async (datum: any) => {
                    jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
                    expect(await apiUsers.getSettings(datum.id)).toMatchSnapshot();
                }),
            );
        });
    });

    describe('updateSettings()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: data.settings(1) });
            expect(await apiUsers.updateSettings('self', {} as any)).toMatchSnapshot();

            // - Avec les autres utilisateurs.
            await Promise.all(
                data.settings().map(async (datum: any) => {
                    if (datum.id === 1) {
                        return;
                    }

                    jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
                    expect(await apiUsers.updateSettings(datum.id, {} as any)).toMatchSnapshot();
                }),
            );
        });
    });

    describe('restore()', () => {
        it.each(data.details())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data: datum });
            expect(await apiUsers.restore(datum.id)).toMatchSnapshot();
        });
    });
});
