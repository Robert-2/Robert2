import moment from 'moment';
import formatEvent from '@/pages/Calendar/utils';

describe('Calendar/utils.formatEvent', () => {
  test('returns data of event formatted for timeline usage with classes and popups texts', () => {
    const rawEvent = {
      id: 1,
      title: 'Test event',
      start_date: '2019-10-01 00:00:00',
      end_date: '2019-10-02 23:59:59',
      is_confirmed: false,
      has_missing_materials: true,
      location: 'Testville',
    };

    const result = formatEvent(rawEvent, (s) => s);
    expect(result).toBeDefined();

    expect(result.title).toEqual(
      'Test event (Testville)\n  →page-calendar.this-event-is-past\n  →page-calendar.this-event-has-missing-materials',
    );
    expect(result.content).toEqual('Test event (Testville)');
    expect(result.className).toEqual('timeline-event timeline-event--past timeline-event--with-warning');
    expect(result.editable).toBe(true);
    expect(result.hasMissingMaterials).toBe(true);
    expect(result.start).toBeInstanceOf(moment);
    expect(result.end).toBeInstanceOf(moment);
  });
});
