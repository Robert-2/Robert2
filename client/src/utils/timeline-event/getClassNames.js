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

  if (isPastAndConfirmed) { // Then event can be closed
    classNames.push(isClosed ? 'timeline-event--closed' : 'timeline-event--unclosed');
  } else { // event either not past or not isConfirmed
    // Timing
    if (isPast) {
      classNames.push('timeline-event--error');
    } else if (isCurrent) {
      classNames.push('timeline-event--current');
    }
    // Confirmation
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
