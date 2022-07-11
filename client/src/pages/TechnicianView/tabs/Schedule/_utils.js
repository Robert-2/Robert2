/* eslint-disable import/prefer-default-export */
import formatEventTechnician from '@/utils/formatEventTechnician';

export const formatTechnicianEvent = (technicianEvent) => {
    const { id, eventId, title, start, end } = formatEventTechnician(technicianEvent);
    const { is_confirmed: isConfirmed } = technicianEvent.event;

    const classes = [];
    if (end.isBefore(new Date(), 'day')) {
        classes.push('cv-item--past');
    }
    if (!isConfirmed) {
        classes.push('cv-item--not-confirmed');
    }

    return { id, eventId, startDate: start, endDate: end, title, classes };
};
