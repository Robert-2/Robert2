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
        start_time: startTime,
        end_time: endTime,
    } = eventTechnician;

    const { title: eventTitle, location } = event;

    let title = eventTitle;
    if (location) {
        title = `${title} (${location})`;
    }

    const start = moment.utc(startTime).local();
    const end = moment.utc(endTime).local();
    const duration = end.diff(start, 'days') + 1;
    let dateFormat = 'LT';
    if (duration > 1) {
        dateFormat = 'DD MMMM, LT';
    }

    const datesString = `${start.format(dateFormat)} ⇒ ${end.format(dateFormat)}`;
    const content = position ? `${datesString} : ${position}` : datesString;
    title = `${title}\n${content}`;

    return { id, eventId, start, end, content, title };
};

export default formatEventTechnician;
