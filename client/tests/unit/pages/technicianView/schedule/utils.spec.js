import formatTechnicianEvent from '@/pages/TechnicianView/Schedule/utils';

describe('TechnicianView/Schedule/utils.formatTechnicianEvent', () => {
  test('returns data of event formatted for calendar usage with title and classes', () => {
    const rawTechnicianEvent = {
      id: 1,
      event_id: 2,
      technician_id: 3,
      start_time: '2019-10-01 08:00:00',
      end_time: '2019-10-02 23:00:00',
      position: 'Régisseur',
      event: {
        id: 2,
        user_id: 1,
        title: 'Test event',
        description: null,
        start_date: '2019-10-01 00:00:00',
        end_date: '2019-10-02 23:59:59',
        is_confirmed: false,
        is_archived: false,
        location: 'Testville',
        is_return_inventory_done: false,
      },
    };

    const result = formatTechnicianEvent(rawTechnicianEvent);
    expect(result).toBeDefined();

    expect(result.id).toBe(1);
    expect(result.startDate).toEqual('2019-10-01 08:00:00');
    expect(result.endDate).toEqual('2019-10-02 23:00:00');
    expect(result.title).toEqual('Test event (Régisseur)\n10/1/2019 8:00 AM - 10/2/2019 11:00 PM');
    expect(result.classes).toEqual(['cv-item--past', 'cv-item--not-confirmed']);
  });
});
