const APP_NAME = 'Robert2';

const DATE_DB_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_QUERY_FORMAT = 'YYYY-MM-DD';
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export {
  APP_NAME,
  DATE_DB_FORMAT,
  DATE_QUERY_FORMAT,
  DEBOUNCE_WAIT,
  AUTHORIZED_FILE_TYPES,
  MAX_FILE_SIZE,
};
