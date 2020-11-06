import moment from 'moment';

const formatEvent = (dataEvent) => {
  const {
    start_date: rawStartDate,
    end_date: rawEndDate,
    is_confirmed: isConfirmed,
    has_missing_materials: hasMissingMaterials,
  } = dataEvent;

  const now = moment();
  const startDate = moment(rawStartDate);
  const endDate = moment(rawEndDate);
  const isPast = endDate.isBefore(now, 'day');
  const isCurrent = now.isBetween(startDate, endDate, 'day', '[]');

  return {
    ...dataEvent,
    startDate,
    endDate,
    isConfirmed,
    isPast,
    isCurrent,
    hasMissingMaterials,
  };
};

const formatTimelineEvent = (dataEvent, translate) => {
  const {
    id,
    title,
    startDate: start,
    endDate: end,
    isPast,
    isCurrent,
    isConfirmed,
    location,
    hasMissingMaterials,
  } = formatEvent(dataEvent);

  let content = title;
  if (location) {
    content = `${title} (${location})`;
  }

  const eventStatus = [];

  const classNames = ['Calendar__event'];
  if (isPast) {
    classNames.push('Calendar__event--past');
    eventStatus.push(translate('page-calendar.this-event-is-past'));
  }

  if (isCurrent) {
    classNames.push('Calendar__event--current');
    eventStatus.push(translate('page-calendar.this-event-is-currently-running'));
  }

  if (isConfirmed) {
    eventStatus.push(translate('page-calendar.this-event-is-confirmed'));

    if (!isPast) {
      classNames.push('Calendar__event--confirmed');
    }
  }

  const isLocked = isConfirmed;
  if (isLocked) {
    classNames.push('Calendar__event--locked');
  }

  if (hasMissingMaterials) {
    classNames.push('Calendar__event--with-warning');
    eventStatus.push(translate('page-calendar.this-event-has-missing-materials'));
  }

  let eventTitle = content;
  if (eventStatus.length > 0) {
    eventTitle += `\n  →${eventStatus.join('\n  →')}`;
  }

  return {
    id,
    content,
    start,
    end,
    editable: !isLocked,
    className: classNames.join(' '),
    title: eventTitle,
    hasMissingMaterials,
  };
};

export default {
  formatEvent,
  formatTimelineEvent,
};
