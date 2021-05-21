import getTimelineEventI18nStatuses from '@/utils/timeline-event/getI18nStatuses';

const formatTestEvent = (testEvent) => {
  const isPastAndConfirmed = testEvent.isPast && testEvent.isConfirmed;
  return {
    ...testEvent,
    isPastAndConfirmed,
  };
};

describe('getTimelineEventI18nStatuses', () => {
  test('When event is future, and not confirmed', () => {
    const testEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'arrow-right', i18nKey: 'this-event-is-future' },
      { icon: 'lock-open', i18nKey: 'this-event-is-not-confirmed' },
    ]);
  });

  test('When event is current, and not confirmed', () => {
    const testEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
      { icon: 'lock-open', i18nKey: 'this-event-is-not-confirmed' },
    ]);
  });

  test('When event is past, and not confirmed', () => {
    const testEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'history', i18nKey: 'this-event-is-past' },
      { icon: 'times-circle', i18nKey: 'this-event-is-past-but-not-confirmed' },
    ]);
  });

  test('When event is future, and confirmed', () => {
    const testEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'arrow-right', i18nKey: 'this-event-is-future' },
      { icon: 'lock', i18nKey: 'this-event-is-confirmed' },
    ]);
  });

  test('When event is current, and confirmed', () => {
    const testEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
      { icon: 'lock', i18nKey: 'this-event-is-confirmed' },
    ]);
  });

  test('When event is past and confirmed, but not closed', () => {
    const testEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'history', i18nKey: 'this-event-is-past' },
      { icon: 'folder-open', i18nKey: 'this-event-is-not-closed' },
    ]);
  });

  test('When event is past, confirmed and closed', () => {
    const testEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isClosed: true,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'history', i18nKey: 'this-event-is-past' },
      { icon: 'check', i18nKey: 'this-event-is-closed' },
    ]);
  });

  test('When event is future, unconfirmed and has missing materials', () => {
    const testEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'arrow-right', i18nKey: 'this-event-is-future' },
      { icon: 'lock-open', i18nKey: 'this-event-is-not-confirmed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is current, unconfirmed and has missing materials', () => {
    const testEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
      { icon: 'lock-open', i18nKey: 'this-event-is-not-confirmed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is past, unconfirmed and has missing materials', () => {
    const testEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'history', i18nKey: 'this-event-is-past' },
      { icon: 'times-circle', i18nKey: 'this-event-is-past-but-not-confirmed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is future, confirmed, and has missing materials', () => {
    const testEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'arrow-right', i18nKey: 'this-event-is-future' },
      { icon: 'lock', i18nKey: 'this-event-is-confirmed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is current, confirmed, and has missing materials', () => {
    const testEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
      { icon: 'lock', i18nKey: 'this-event-is-confirmed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is past and confirmed, but unclosed and has missing materials', () => {
    const testEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'history', i18nKey: 'this-event-is-past' },
      { icon: 'folder-open', i18nKey: 'this-event-is-not-closed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is past, confirmed and closed but has missing materials', () => {
    const testEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isClosed: true,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formatTestEvent(testEvent));
    expect(result).toEqual([
      { icon: 'history', i18nKey: 'this-event-is-past' },
      { icon: 'check', i18nKey: 'this-event-is-closed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });
});
