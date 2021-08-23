import moment from 'moment';

const formatEventTechnician = (eventTechnician) => {
    if (!eventTechnician) {
        return null;
    }

    const {
        id,
        event,
        position,
        event_id: eventId,
        start_time: start,
        end_time: end,
    } = eventTechnician;

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
    const content = position ? `${datesString} : ${position}` : datesString;
    title = `${title}\n${content}`;

    return { id, eventId, start, end, content, title };
};

export default formatEventTechnician;
