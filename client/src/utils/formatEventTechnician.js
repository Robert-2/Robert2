import moment from 'moment';

const formatEventTechnician = (eventTechnician) => {
  const { id, start_time: start, end_time: end, position, event } = eventTechnician;
  const { title: eventTitle, location } = event;

  let title = eventTitle;
  if (location) {
    title = `${title} (${location})`;
  }

  const _start = moment(start);
  const _end = moment(end);
  const duration = _end.diff(_start, 'days') + 1;
  let dateFormat = 'LT';
  if (duration > 1) {
    dateFormat = 'DD MMMM, LT';
  }

  const datesString = `${_start.format(dateFormat)} ⇒ ${_end.format(dateFormat)}`;
  if (position) {
    title = `${title}\n<strong>${position}</strong> : ${datesString}`;
  } else {
    title = `${title}\n${datesString}`;
  }

  return { id, start, end, datesString, title };
};

export default formatEventTechnician;
