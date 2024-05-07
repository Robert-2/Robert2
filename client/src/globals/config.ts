import deepFreeze from 'deep-freeze-strict';

let baseUrl = process.env.VUE_APP_API_URL ?? '';
if (window.__SERVER_CONFIG__ && window.__SERVER_CONFIG__.baseUrl) {
    baseUrl = window.__SERVER_CONFIG__.baseUrl;
}

const defaultConfig: GlobalConfig = {
    baseUrl,
    version: '__DEV__',
    api: {
        url: `${baseUrl}/api`,
        headers: { Accept: 'application/json' },
    },
    defaultLang: 'fr',
    currency: {
        symbol: '€',
        name: 'Euro',
        iso: 'EUR',
    },
    auth: {
        cookie: 'Authorization',
        timeout: 12, // - En heures (ou `null` pour un cookie de session).
    },
    companyName: null,
    defaultPaginationLimit: 100,
    maxConcurrentFetches: 2,
    billingMode: 'partial',
    maxFileUploadSize: 25 * 1024 * 1024,
    colorSwatches: null,
    authorizedFileTypes: [
        'application/pdf',
        'application/zip',
        'application/x-rar-compressed',
        'application/gzip',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'text/plain',
        'text/csv',
        'text/xml',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.text',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    authorizedImageTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
    ],
};

const globalConfig = window.__SERVER_CONFIG__ || defaultConfig;

export default deepFreeze(globalConfig);
