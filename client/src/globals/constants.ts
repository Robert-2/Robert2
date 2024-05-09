import DateTime from '@/utils/datetime';

/** Durée de temporisation de base (e.g. entres deux requêtes répétitives). */
const DEBOUNCE_WAIT_DURATION = DateTime.duration(500, 'milliseconds');

/** Durée minimum d'assignation d'un technicien dans un événement. */
const MIN_TECHNICIAN_ASSIGNMENT_DURATION = DateTime.duration(15, 'minutes');

export {
    DEBOUNCE_WAIT_DURATION,
    MIN_TECHNICIAN_ASSIGNMENT_DURATION,
};
