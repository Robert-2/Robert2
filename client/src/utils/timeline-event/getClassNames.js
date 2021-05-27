const getTimelineEventClassNames = (formattedEvent) => {
  const {
    isPast,
    isCurrent,
    isConfirmed,
    hasMissingMaterials,
    isInventoryDone,
    hasNotReturnedMaterials,
  } = formattedEvent;

  const classNames = ['timeline-event'];

  if (isPast) {
    classNames.push('timeline-event--past');

    if (isConfirmed && !isInventoryDone) {
      classNames.push('timeline-event--no-return-inventory');
    }
  }

  if (isCurrent) {
    classNames.push('timeline-event--current');
  }

  if (!isConfirmed) {
    classNames.push('timeline-event--not-confirmed');
  }

  if (hasMissingMaterials || hasNotReturnedMaterials) {
    classNames.push('timeline-event--with-warning');
  }

  return classNames;
};

export default getTimelineEventClassNames;
