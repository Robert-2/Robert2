import moment from 'moment';

const APP_NAME = 'Loxya (Robert2)';

const DATE_DB_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DEBOUNCE_WAIT = 500; // - En millisecondes

const TECHNICIAN_EVENT_STEP = moment.duration(15, 'minutes');
const TECHNICIAN_EVENT_MIN_DURATION = moment.duration(15, 'minutes');

export {
    APP_NAME,
    DATE_DB_FORMAT,
    DEBOUNCE_WAIT,
    TECHNICIAN_EVENT_STEP,
    TECHNICIAN_EVENT_MIN_DURATION,
};
