import getRuntimeVm from '@/utils/getRuntimeVm';

type I18nTranslate = (key: string, params?: Record<string, number | string>, count?: number) => string;

const useI18n = (): I18nTranslate => {
    const vm = getRuntimeVm();
    return getRuntimeVm().$t.bind(vm);
};

export default useI18n;
