import getTimelineEventClassNames from '@/utils/timeline-event/getClassNames';

describe('getTimelineEventClassNames', () => {
  test('When event is future, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual(['timeline-event']);
  });

  test('When event is current, and not confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
    ]);
  });

  test('When event is past, and not confirmed', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--past',
    ]);
  });

  test('When event is future, and confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--locked',
      'timeline-event--confirmed',
    ]);
  });

  test('When event is current, and confirmed', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
      'timeline-event--locked',
      'timeline-event--confirmed',
    ]);
  });

  test('When event is past, and confirmed', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--past',
      'timeline-event--locked',
    ]);
  });

  test('When event is future, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is current, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is past, and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--past',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is future, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--locked',
      'timeline-event--confirmed',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is current, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
      'timeline-event--locked',
      'timeline-event--confirmed',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is past, confirmed, and has missing materials', () => {
    const formattedEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formattedEvent);
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--past',
      'timeline-event--locked',
      'timeline-event--with-warning',
    ]);
  });
});
