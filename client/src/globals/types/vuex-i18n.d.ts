declare module 'vuex-i18n' {
    export type I18nTranslate = (key: string, params?: Record<string, number | string>, count?: number) => string;
}
