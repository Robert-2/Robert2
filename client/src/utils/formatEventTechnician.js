import moment from 'moment';

const formatEventTechnician = (eventTechnician) => {
  const { id, start_time: start, end_time: end, position, event } = eventTechnician;
  const { title: eventTitle } = event;

  let title = eventTitle;
  if (position) {
    title = `${title} (${position})`;
  }

  const _start = moment(start);
  const _end = moment(end);
  const duration = _end.diff(_start, 'days') + 1;
  let dateFormat = 'LT';
  if (duration > 1) {
    dateFormat = 'l LT';
  }

  title = `${title}\n${_start.format(dateFormat)} - ${_end.format(dateFormat)}`;

  return { id, start, end, title };
};

export default formatEventTechnician;
