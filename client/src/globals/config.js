import deepFreeze from 'deep-freeze-strict';

let baseUrl = process.env.VUE_APP_API_URL ?? '';
if (window.__SERVER_CONFIG__ && window.__SERVER_CONFIG__.baseUrl) {
    baseUrl = window.__SERVER_CONFIG__.baseUrl;
}

const defaultConfig = {
    baseUrl,
    api: {
        url: `${baseUrl}/api`,
        headers: { Accept: 'application/json' },
        version: '_dev mode_',
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
    billingMode: 'partial',
    maxFileUploadSize: 25 * 1024 * 1024,
};

const globalConfig = window.__SERVER_CONFIG__ || defaultConfig;

export default deepFreeze(globalConfig);
