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
      is_closed: false,
      has_missing_materials: true,
      location: 'Testville',
      beneficiaries: [
        { id: 1, full_name: 'Jean Benef' },
      ],
      assignees: [
        { id: 1, full_name: 'Marc Tekos' },
      ],
    };

    const result = formatEvent(rawEvent, (s) => s);
    expect(result).toBeDefined();

    expect(result.title).toEqual(
      '<strong>Test event</strong>'
      + '\n\n<i class="fas fa-map-marker-alt"></i> Testville'
      + '\n<i class="fas fa-clock"></i> from-date-to-date'
      + '\n<i class="fas fa-address-book"></i> for Jean Benef'
      + '\n<i class="fas fa-people-carry"></i> with Marc Tekos'
      + '\n\n<i class="fas fa-history"></i> page-calendar.this-event-is-past'
      + '\n<i class="fas fa-times-circle"></i> page-calendar.this-event-is-past-but-not-confirmed'
      + '\n<i class="fas fa-exclamation-triangle"></i> page-calendar.this-event-has-missing-materials',
    );
    expect(result.content).toEqual(
      '<i class="fas fa-times-circle"></i> '
      + '<i class="fas fa-exclamation-triangle"></i> Test event − '
      + '<i class="fas fa-map-marker-alt"></i> Testville',
    );
    expect(result.className).toEqual(
      'timeline-event timeline-event--invalid timeline-event--with-warning',
    );
    expect(result.editable).toBe(true);
    expect(result.hasMissingMaterials).toBe(true);
    expect(result.start).toBeInstanceOf(moment);
    expect(result.end).toBeInstanceOf(moment);
  });
});
