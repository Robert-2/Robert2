import requester from '@/globals/requester';
import apiSettings from '@/stores/api/settings';
import data from '@fixtures/settings';

describe('Settings Api', () => {
    describe('all()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'get').mockResolvedValue({ data });
            expect(await apiSettings.all()).toMatchSnapshot();
        });
    });

    describe('update()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'put').mockResolvedValue({ data });
            expect(await apiSettings.update({} as any)).toMatchSnapshot();
        });
    });

    describe('reset()', () => {
        it('parse the returned data correctly', async () => {
            jest.spyOn(requester, 'delete').mockResolvedValue({ data });
            expect(await apiSettings.reset('calendar.public.url')).toMatchSnapshot();
        });
    });
});
