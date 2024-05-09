import requester from '@/globals/requester';
import apiSession from '@/stores/api/session';
import data from '@fixtures/users';

describe('Session Api', () => {
    describe('get()', () => {
        it.each(data.session())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data: datum });
            expect(await apiSession.get()).toMatchSnapshot();
        });
    });

    describe('create()', () => {
        it.each(data.session())('parse the returned data correctly (with #$id)', async (datum: any) => {
            jest.spyOn(requester, 'post').mockResolvedValue({
                data: Object.assign(datum, { token: '__FAKE-TOKEN__' }),
            });
            expect(await apiSession.create({} as any)).toMatchSnapshot();
        });
    });
});
