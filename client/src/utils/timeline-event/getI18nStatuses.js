const getTimelineEventI18nStatuses = (formattedEvent) => {
  const {
    isPast,
    isCurrent,
    isConfirmed,
    isPastAndConfirmed,
    isClosed,
    hasMissingMaterials,
  } = formattedEvent;

  const eventStatuses = [];

  // Timing
  if (isPast) {
    eventStatuses.push({
      icon: 'history',
      i18nKey: 'this-event-is-past',
    });
  } else if (isCurrent) {
    eventStatuses.push({
      icon: 'running',
      i18nKey: 'this-event-is-currently-running',
    });
  } else {
    eventStatuses.push({
      icon: 'arrow-right',
      i18nKey: 'this-event-is-future',
    });
  }

  // Event status
  if (isPastAndConfirmed) {
    // Event is either closed or unclosed
    eventStatuses.push({
      icon: isClosed ? 'check' : 'folder-open',
      i18nKey: isClosed ? 'this-event-is-closed' : 'this-event-isnot-closed',
    });
  } else if (isPast && !isConfirmed) {
    // Danger state: past and not confirmed
    eventStatuses.push({
      icon: 'times-circle',
      i18nKey: 'this-event-is-past-but-not-confirmed',
    });
  } else {
    // Event is current or future. It can be confirmed or not.
    eventStatuses.push({
      icon: isConfirmed ? 'lock' : 'lock-open',
      i18nKey: isConfirmed ? 'this-event-is-confirmed' : 'this-event-isnot-confirmed',
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
