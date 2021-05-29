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
      has_missing_materials: null,
      is_return_inventory_done: false,
      has_not_returned_materials: true,
      location: 'TestVille',
      pivot: {
        id: 1,
        material_id: 1,
        quantity: 3,
        quantity_returned: 1,
        quantity_broken: 0,
      },
    };

    const result = formatEvent(rawEvent, (s) => s);
    expect(result).toBeDefined();

    expect(result.title).toBe(
      '<strong>Test event</strong>, used-count'
      + '\n\n<i class="fas fa-map-marker-alt"></i> TestVille'
      + '\n<i class="fas fa-clock"></i> from-date-to-date'
      + '\n\n<i class="fas fa-exclamation-triangle"></i> page-calendar.this-event-has-not-returned-materials'
      + '\n<i class="fas fa-lock"></i> page-calendar.this-event-is-locked'
      + '\n<i class="fas fa-exclamation-triangle"></i> page-calendar.this-event-needs-its-return-inventory',
    );
    expect(result.content).toBe(
      '<i class="fas fa-clock"></i> <i class="fas fa-exclamation-triangle"></i> Test event (used-count)',
    );
    expect(result.className).toBe(
      'timeline-event timeline-event--past timeline-event--no-return-inventory timeline-event--with-warning',
    );
    expect(result.editable).toBe(false);
    expect(result.hasMissingMaterials).toBe(null);
    expect(result.isInventoryDone).toBe(false);
    expect(result.hasNotReturnedMaterials).toBe(true);
    expect(result.start).toBeInstanceOf(moment);
    expect(result.end).toBeInstanceOf(moment);
  });
});
