import config from '@/globals/config';

const LOCALES_MAP: Record<string, string> = {
    fr: 'fr',
    en: 'en-gb',
};

/**
 * Permet de récupérer la langue par défaut de l'application.
 *
 * @returns - La par défaut de l'application.
 */
export const getDefaultLang = (): string => config.defaultLang;

/**
 * Permet de récupérer la langue actuelle.
 *
 * @returns - La langue actuelle.
 */
export const getLang = (): string => {
    const userLang = localStorage.getItem('userLocale');
    if (userLang && Object.keys(LOCALES_MAP).includes(userLang)) {
        return userLang;
    }
    return getDefaultLang();
};

/**
 * Permet de récupérer la locale actuelle.
 *
 * @returns - La locale actuelle.
 */
export const getLocale = (): string => {
    const lang = getLang();
    return LOCALES_MAP[lang] ?? lang;
};
