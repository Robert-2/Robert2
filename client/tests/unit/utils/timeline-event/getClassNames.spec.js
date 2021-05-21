import getTimelineEventClassNames from '@/utils/timeline-event/getClassNames';

const formatTestEvent = (testEvent) => {
  const isPastAndConfirmed = testEvent.isPast && testEvent.isConfirmed;
  return {
    ...testEvent,
    isPastAndConfirmed,
  };
};

describe('getTimelineEventClassNames', () => {
  test('When event is future, and not confirmed', () => {
    const dataEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual(['timeline-event']);
  });

  test('When event is current, and not confirmed', () => {
    const dataEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
    ]);
  });

  test('When event is past, and not confirmed', () => {
    const dataEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--invalid',
    ]);
  });

  test('When event is future, and confirmed', () => {
    const dataEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--confirmed',
    ]);
  });

  test('When event is current, and confirmed', () => {
    const dataEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
      'timeline-event--confirmed',
    ]);
  });

  test('When event is past and confirmed, but not closed', () => {
    const dataEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--unclosed',
    ]);
  });

  test('When event is past, confirmed and closed', () => {
    const dataEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isClosed: true,
      hasMissingMaterials: false,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--closed',
    ]);
  });

  test('When event is future, unconfirmed and has missing materials', () => {
    const dataEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is current, unconfirmed and has missing materials', () => {
    const dataEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is past, unconfirmed and has missing materials', () => {
    const dataEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: false,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--invalid',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is future, confirmed, and has missing materials', () => {
    const dataEvent = {
      isPast: false,
      isCurrent: false,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--confirmed',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is current, confirmed, and has missing materials', () => {
    const dataEvent = {
      isPast: false,
      isCurrent: true,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--current',
      'timeline-event--confirmed',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is past and confirmed, not closed, and has missing materials', () => {
    const dataEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isClosed: false,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--unclosed',
      'timeline-event--with-warning',
    ]);
  });

  test('When event is past, confirmed and closed, and has missing materials', () => {
    const dataEvent = {
      isPast: true,
      isCurrent: false,
      isConfirmed: true,
      isClosed: true,
      hasMissingMaterials: true,
    };
    const result = getTimelineEventClassNames(formatTestEvent(dataEvent));
    expect(result).toEqual([
      'timeline-event',
      'timeline-event--closed',
      'timeline-event--with-warning',
    ]);
  });
});
