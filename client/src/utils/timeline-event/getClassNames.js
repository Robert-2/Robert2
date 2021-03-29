const getTimelineEventClassNames = (formattedEvent) => {
  const {
    isPast,
    isCurrent,
    isConfirmed,
    hasMissingMaterials,
  } = formattedEvent;

  const classNames = ['timeline-event'];

  if (isPast) {
    classNames.push('timeline-event--past');
  }

  if (isCurrent) {
    classNames.push('timeline-event--current');
  }

  if (isConfirmed) {
    classNames.push('timeline-event--locked');

    if (!isPast) {
      classNames.push('timeline-event--confirmed');
    }
  }

  if (hasMissingMaterials) {
    classNames.push('timeline-event--with-warning');
  }

  return classNames;
};

export default getTimelineEventClassNames;
