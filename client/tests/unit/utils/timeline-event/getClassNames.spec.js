import getTimelineEventClassNames from '@/utils/timeline-event/getClassNames';

describe('getTimelineEventClassNames', () => {
  test('When event is future, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: false,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--not-confirmed',
    ]);
  });

  test('When event is current, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      hasMissingMaterials: false,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
      'timeline-event--not-confirmed',
    ]);
  });

  test('When event is past, and not confirmed', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: null,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--past',
      'timeline-event--not-confirmed',
    ]);
  });

  test('When event is future, and confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: false,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
    ]);
  });

  test('When event is current, and confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      hasMissingMaterials: false,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
    ]);
  });

  test('When event is past, and confirmed', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: null,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--past',
      'timeline-event--no-return-inventory',
    ]);
  });

  test('When event is future, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: true,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--not-confirmed',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is current, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      hasMissingMaterials: true,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
      'timeline-event--not-confirmed',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is past, and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: null,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--past',
      'timeline-event--not-confirmed',
    ]);
  });

  test('When event is future, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: true,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is current, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      hasMissingMaterials: true,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is past, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: null,
      isInventoryDone: false,
      hasNotReturnedMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--past',
      'timeline-event--no-return-inventory',
    ]);
  });

  test('When event is past, confirmed, inventory done, and has materials not returned', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: null,
      isInventoryDone: true,
      hasNotReturnedMaterials: true,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--past',
      'timeline-event--with-warning',
    ]);
  });
});
