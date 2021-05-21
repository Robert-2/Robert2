import moment from 'moment';

const formatTimelineEvent = (dataEvent) => {
  const {
    start_date: rawStartDate,
    end_date: rawEndDate,
    is_confirmed: isConfirmed,
    is_closed: isClosed,
    has_missing_materials: hasMissingMaterials,
  } = dataEvent;

  const now = moment();
  const startDate = moment(rawStartDate);
  const endDate = moment(rawEndDate);
  const isPast = endDate.isBefore(now, 'day');
  const isCurrent = now.isBetween(startDate, endDate, 'day', '[]');

  // Only past and confirmed events can be closed.
  // Closed events cannot be unconfirmed.
  const isPastAndConfirmed = isPast && isConfirmed;

  return {
    ...dataEvent,
    startDate,
    endDate,
    isConfirmed,
    isPast,
    isCurrent,
    isPastAndConfirmed,
    isClosed,
    hasMissingMaterials,
  };
};

export default formatTimelineEvent;
