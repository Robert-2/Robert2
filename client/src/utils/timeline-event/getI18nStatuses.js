const getTimelineEventI18nStatuses = (formattedEvent) => {
  const {
    isPast,
    isCurrent,
    isConfirmed,
    hasMissingMaterials,
  } = formattedEvent;

  const eventStatuses = [];

  if (isPast) {
    eventStatuses.push('this-event-is-past');
  }

  if (isCurrent) {
    eventStatuses.push('this-event-is-currently-running');
  }

  if (isConfirmed) {
    eventStatuses.push('this-event-is-confirmed');
  }

  if (hasMissingMaterials) {
    eventStatuses.push('this-event-has-missing-materials');
  }

  return eventStatuses;
};

export default getTimelineEventI18nStatuses;
