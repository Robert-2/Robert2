/* eslint-disable no-underscore-dangle */
import deepFreeze from 'deep-freeze-strict';

let baseUrl = 'http://robert2-api.etoilenoire';
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
  defaultPaginationLimit: 100,
  beneficiaryTagName: 'Bénéficiaire',
  technicianTagName: 'Technicien',
  billingMode: 'partial',

  // - This function should return a number
  degressiveRate: (daysCount) => (
    ((daysCount - 1) * 0.75) + 1
  ),
};

const globalConfig = window.__SERVER_CONFIG__ || defaultConfig;

export default deepFreeze(globalConfig);
