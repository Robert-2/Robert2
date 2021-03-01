import moment from 'moment';
import formatTimelineEvent from '@/utils/timeline-event/format';

describe('formatTimelineEvent', () => {
  test('returns data of event formatted for timeline usage', () => {
    const rawEvent = {
      id: 1,
      title: 'Test event',
      start_date: '2021-02-25 00:00:00',
      end_date: '2021-02-28 23:59:59',
      is_confirmed: true,
      has_missing_materials: false,
      location: 'Testville',
    };

    const result = formatTimelineEvent(rawEvent);
    expect(result).toBeDefined();

    expect(result.title).toEqual('Test event');
    expect(result.isConfirmed).toBe(true);
    expect(result.isCurrent).toBe(false);
    expect(result.isPast).toBe(true);
    expect(result.hasMissingMaterials).toBe(false);
    expect(result.startDate).toBeInstanceOf(moment);
    expect(result.endDate).toBeInstanceOf(moment);
  });
});
