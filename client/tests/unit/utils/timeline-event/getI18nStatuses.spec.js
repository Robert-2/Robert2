import getTimelineEventI18nStatuses from '@/utils/timeline-event/getI18nStatuses';

describe('getTimelineEventI18nStatuses', () => {
  test('When event is future, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([]);
  });

  test('When event is current, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual(['this-event-is-currently-running']);
  });

  test('When event is past, and not confirmed', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual(['this-event-is-past']);
  });

  test('When event is future, and confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual(['this-event-is-confirmed']);
  });

  test('When event is current, and confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      'this-event-is-currently-running',
      'this-event-is-confirmed',
    ]);
  });

  test('When event is past, and confirmed', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      'this-event-is-past',
      'this-event-is-confirmed',
    ]);
  });

  test('When event is future, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual(['this-event-has-missing-materials']);
  });

  test('When event is current, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      'this-event-is-currently-running',
      'this-event-has-missing-materials',
    ]);
  });

  test('When event is past, and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      'this-event-is-past',
      'this-event-has-missing-materials',
    ]);
  });

  test('When event is future, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      'this-event-is-confirmed',
      'this-event-has-missing-materials',
    ]);
  });

  test('When event is current, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      'this-event-is-currently-running',
      'this-event-is-confirmed',
      'this-event-has-missing-materials',
    ]);
  });

  test('When event is past, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      'this-event-is-past',
      'this-event-is-confirmed',
      'this-event-has-missing-materials',
    ]);
  });
});
