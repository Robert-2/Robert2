/* eslint-disable import/prefer-default-export */

import moment from 'moment';
import formatEventTechnician from '@/utils/formatEventTechnician';

export const formatTechnicianEvent = (technicianEvent) => {
    const { id, title, start: startDate, end: endDate } = formatEventTechnician(technicianEvent);
    const { is_confirmed: isConfirmed } = technicianEvent.event;

    const classes = [];
    if (moment(endDate).isBefore(new Date(), 'day')) {
        classes.push('cv-item--past');
    }
    if (!isConfirmed) {
        classes.push('cv-item--not-confirmed');
    }

    return { id, startDate, endDate, title, classes };
};
