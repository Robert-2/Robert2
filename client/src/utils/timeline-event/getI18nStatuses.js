const getTimelineEventI18nStatuses = (formattedEvent) => {
  const {
    isPast,
    isCurrent,
    isConfirmed,
    hasMissingMaterials,
  } = formattedEvent;

  const eventStatuses = [];

  if (isPast && !isConfirmed) {
    eventStatuses.push({
      icon: 'history',
      i18nKey: 'this-event-is-past',
    });
  }

  if (isCurrent) {
    eventStatuses.push({
      icon: 'running',
      i18nKey: 'this-event-is-currently-running',
    });
  }

  if (isConfirmed) {
    eventStatuses.push({
      icon: isPast ? 'lock' : 'check',
      i18nKey: isPast ? 'this-event-is-locked-past-confirmed' : 'this-event-is-confirmed',
    });
  }

  if (hasMissingMaterials) {
    eventStatuses.push({
      icon: 'exclamation-triangle',
      i18nKey: 'this-event-has-missing-materials',
    });
  }

  return eventStatuses;
};

export default getTimelineEventI18nStatuses;
