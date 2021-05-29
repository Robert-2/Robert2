import getTimelineEventI18nStatuses from '@/utils/timeline-event/getI18nStatuses';

describe('getTimelineEventI18nStatuses', () => {
  test('When event is future, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      isArchived: false,
      isInventoryDone: false,
      hasMissingMaterials: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'question', i18nKey: 'this-event-is-not-confirmed' },
    ]);
  });

  test('When event is current, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      isArchived: false,
      isInventoryDone: false,
      hasMissingMaterials: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'question', i18nKey: 'this-event-is-not-confirmed' },
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
    ]);
  });

  test('When event is past, and not confirmed', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      isArchived: false,
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
      isArchived: false,
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
      isArchived: false,
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

  test('When event is past and confirmed, but not archived', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isArchived: false,
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

  test('When event is past, confirmed and archived', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isArchived: true,
      isInventoryDone: true,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'box', i18nKey: 'this-event-is-archived' },
    ]);
  });

  test('When event is future, not confirmed and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      isArchived: false,
      isInventoryDone: false,
      hasMissingMaterials: true,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'question', i18nKey: 'this-event-is-not-confirmed' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is current, not confirmed and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      isArchived: false,
      isInventoryDone: false,
      hasMissingMaterials: true,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'question', i18nKey: 'this-event-is-not-confirmed' },
      { icon: 'running', i18nKey: 'this-event-is-currently-running' },
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-missing-materials' },
    ]);
  });

  test('When event is past, not confirmed and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      isArchived: false,
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
      isArchived: false,
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
      isArchived: false,
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

  test('When event is past and confirmed, but not archived and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isArchived: false,
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
      isArchived: false,
      isInventoryDone: true,
      hasMissingMaterials: null,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'lock', i18nKey: 'this-event-is-locked' },
    ]);
  });

  test('When event is past, confirmed, inventory done, has materials not returned and not archived', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isArchived: false,
      isInventoryDone: true,
      hasMissingMaterials: null,
      hasNotReturnedMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-not-returned-materials' },
      { icon: 'lock', i18nKey: 'this-event-is-locked' },
    ]);
  });

  test('When event is past, confirmed, inventory done, has materials not returned and is archived', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isArchived: true,
      isInventoryDone: true,
      hasMissingMaterials: null,
      hasNotReturnedMaterials: true,
    };
    const result = getTimelineEventI18nStatuses(formattedEvent);
    expect(result).toEqual([
      { icon: 'exclamation-triangle', i18nKey: 'this-event-has-not-returned-materials' },
      { icon: 'box', i18nKey: 'this-event-is-archived' },
    ]);
  });
});
