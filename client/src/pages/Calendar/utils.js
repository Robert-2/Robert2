import moment from 'moment';

const formatEvent = (dataEvent) => {
  const {
    start_date: rawStartDate,
    end_date: rawEndDate,
    is_confirmed: isConfirmed,
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
  };
};

const formatTimelineEvent = (dataEvent) => {
  const {
    id,
    title,
    startDate: start,
    endDate: end,
    isPast,
    isCurrent,
    isConfirmed,
    location,
  } = formatEvent(dataEvent);
  const isLocked = isPast || isConfirmed;

  const classNames = ['Calendar__event'];
  if (isPast) {
    classNames.push('Calendar__event--past');
  }

  if (isCurrent) {
    classNames.push('Calendar__event--current');
  }

  if (isConfirmed && !isPast) {
    classNames.push('Calendar__event--confirmed');
  }

  if (isLocked) {
    classNames.push('Calendar__event--locked');
  }

  let content = title;
  if (location) {
    content = `${title} (${location})`;
  }

  return {
    id,
    content,
    start,
    end,
    editable: !isLocked,
    className: classNames.join(' '),
  };
};

export default {
  formatEvent,
  formatTimelineEvent,
};
