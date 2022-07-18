import moment from 'moment';

const APP_NAME = 'Robert2';

const DATE_DB_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DEBOUNCE_WAIT = 500; // - in milliseconds

const AUTHORIZED_FILE_TYPES = [
    'application/pdf',
    'application/zip',
    'application/x-rar-compressed',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.text',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

const TECHNICIAN_EVENT_STEP = moment.duration(15, 'minutes');
const TECHNICIAN_EVENT_MIN_DURATION = moment.duration(15, 'minutes');

export {
    APP_NAME,
    DATE_DB_FORMAT,
    DEBOUNCE_WAIT,
    AUTHORIZED_FILE_TYPES,
    ALLOWED_IMAGE_TYPES,
    TECHNICIAN_EVENT_STEP,
    TECHNICIAN_EVENT_MIN_DURATION,
};
