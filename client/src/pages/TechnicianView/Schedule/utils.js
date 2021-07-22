import moment from 'moment';

const formatTechnicianEvent = (technicianEvent) => {
  const { id, start_time: startDate, end_time: endDate, position, event } = technicianEvent;
  const { title: eventTitle, is_confirmed: isConfirmed } = event;

  const start = moment(startDate);
  const end = moment(endDate);

  let title = eventTitle;
  if (position) {
    title = `${title} (${position})`;
  }

  const duration = end.diff(start, 'days') + 1;
  let dateFormat = 'LT';
  if (duration > 1) {
    dateFormat = 'l LT';
  }

  title = `${title}\n${start.format(dateFormat)} - ${end.format(dateFormat)}`;

  const classes = [];
  if (end.isBefore(new Date(), 'day')) {
    classes.push('cv-item--past');
  }
  if (!isConfirmed) {
    classes.push('cv-item--not-confirmed');
  }

  return { id, startDate, endDate, title, classes };
};

export default formatTechnicianEvent;
