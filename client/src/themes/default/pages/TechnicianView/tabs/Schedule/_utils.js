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

    // - Si la date de fin est minuit du jour suivant, on la met à la seconde précédente
    //   pour éviter que le slot apparaisse dans le jour suivant sur le calendrier.
    const endDate = end.format('HH:mm:ss') === '00:00:00'
        ? end.clone().subtract(1, 'seconds')
        : end;

    return { id, eventId, startDate: start, endDate, title, classes };
};
