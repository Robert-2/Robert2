import 'vue';
import 'vuex-i18n';

declare module 'vuex-i18n' {
    export type I18nTranslate = (key: string, params?: Record<string, number | string>, count?: number) => string;
}

declare module 'vue/types/vue' {
    interface Vue {
        $t(key: string, params?: Record<string, number | string>, count?: number): string;
        $t(key: string, defaultValue: string, params?: Record<string, number | string>, count?: number): string;
    }
}
