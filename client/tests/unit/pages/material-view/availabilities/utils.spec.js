import moment from 'moment';
import formatEvent from '@/pages/MaterialView/Availabilities/utils';

describe('MaterialView/Availabilities/utils.formatEvent', () => {
  test('returns data of event formatted for timeline usage with classes and popups texts', () => {
    const rawEvent = {
      id: 1,
      title: 'Test event',
      start_date: '2021-02-26 00:00:00',
      end_date: '2021-02-28 23:59:59',
      is_confirmed: true,
      has_missing_materials: false,
      location: 'TestVille',
      pivot: {
        id: 1,
        material_id: 1,
        quantity: 3,
      },
    };

    const result = formatEvent(rawEvent, (s) => s);
    expect(result).toBeDefined();

    expect(result.title).toBe(
      'Test event - TestVille\n'
      + '  →page-calendar.this-event-is-past\n'
      + '  →page-calendar.this-event-is-confirmed',
    );
    expect(result.content).toBe('Test event (3)');
    expect(result.className).toBe('timeline-event timeline-event--past timeline-event--locked');
    expect(result.editable).toBe(false);
    expect(result.hasMissingMaterials).toBe(false);
    expect(result.start).toBeInstanceOf(moment);
    expect(result.end).toBeInstanceOf(moment);
  });
});
