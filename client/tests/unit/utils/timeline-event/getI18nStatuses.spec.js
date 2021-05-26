import getTimelineEventI18nStatuses from '@/utils/timeline-event/getI18nStatuses';

describe('getTimelineEventI18nStatuses', () => {
  test('When event is future, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      isInventoryDone: false,
      hasMissingMaterials: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([]);
  });

  test('When event is current, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      isInventoryDone: false,
      hasMissingMaterials: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
    ]);
  });

  test('When event is past, and not confirmed', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      isInventoryDone: false,
      hasMissingMaterials: null,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'history', i18nKey: 'this-event-is-past' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-needs-its-return-inventory' },
    ]);
  });

  test('When event is future, and confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      isInventoryDone: false,
      hasMissingMaterials: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'check', i18nKey: 'this-event-is-confirmed' },
    ]);
  });

  test('When event is current, and confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      isInventoryDone: false,
      hasMissingMaterials: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
      { icon: 'check', i18nKey: 'this-event-is-confirmed' },
    ]);
  });

  test('When event is past, and confirmed', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isInventoryDone: false,
      hasMissingMaterials: null,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'lock', i18nKey: 'this-event-is-locked' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-needs-its-return-inventory' },
    ]);
  });

  test('When event is future, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      isInventoryDone: false,
      hasMissingMaterials: true,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is current, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      isInventoryDone: false,
      hasMissingMaterials: true,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is past, and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      isInventoryDone: false,
      hasMissingMaterials: null,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'history', i18nKey: 'this-event-is-past' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-needs-its-return-inventory' },
    ]);
  });

  test('When event is future, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      isInventoryDone: false,
      hasMissingMaterials: true,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'check', i18nKey: 'this-event-is-confirmed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is current, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      isInventoryDone: false,
      hasMissingMaterials: true,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
      { icon: 'check', i18nKey: 'this-event-is-confirmed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is past, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isInventoryDone: false,
      hasMissingMaterials: null,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'lock', i18nKey: 'this-event-is-locked' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-needs-its-return-inventory' },
    ]);
  });

  test('When event is past, confirmed, and has a return inventory OK', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isInventoryDone: true,
      hasMissingMaterials: null,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'lock', i18nKey: 'this-event-is-locked' },
    ]);
  });

  test('When event is past, confirmed, inventory done and has materials not returned', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isInventoryDone: true,
      hasMissingMaterials: null,
      hasNotReturnedMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'lock', i18nKey: 'this-event-is-locked' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-not-returned-materials' },
    ]);
  });
});
