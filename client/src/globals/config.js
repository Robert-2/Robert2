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
        symbol_intl: '€',
        decimal_digits: 2,
        rounding: 0,
    },
    auth: {
        cookie: 'Authorization',
        timeout: 12, // - En heures (ou `null` pour un cookie de session).
    },
    defaultPaginationLimit: 100,
    beneficiaryTagName: 'Bénéficiaire',
    technicianTagName: 'Technicien',
    billingMode: 'partial',
    maxFileUploadSize: 25 * 1024 * 1024,

    // - Cette fonction doit retourner un nombre.
    degressiveRate: (daysCount) => (daysCount - 1) * 0.75 + 1,
};

const globalConfig = window.__SERVER_CONFIG__ || defaultConfig;

export default deepFreeze(globalConfig);
