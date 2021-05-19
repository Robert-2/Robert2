const getTimelineEventClassNames = (formattedEvent) => {
  const {
    isPast,
    isCurrent,
    isConfirmed,
    isPastAndConfirmed,
    isClosed,
    hasMissingMaterials,
  } = formattedEvent;

  const classNames = ['timeline-event'];

  if (isPastAndConfirmed) {
    classNames.push(isClosed ? 'timeline-event--closed' : 'timeline-event--unclosed');
  } else {
    if (isPast) {
      classNames.push('timeline-event--invalid');
    } else if (isCurrent) {
      classNames.push('timeline-event--current');
    }
    if (isConfirmed) {
      classNames.push('timeline-event--confirmed');
    }
  }

  if (hasMissingMaterials) {
    classNames.push('timeline-event--with-warning');
  }

  return classNames;
};

export default getTimelineEventClassNames;
