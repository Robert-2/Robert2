import getRuntimeVm from '@/utils/getRuntimeVm';

import type { I18nTranslate } from 'vuex-i18n';

const useI18n = (): I18nTranslate => {
    const vm = getRuntimeVm();
    return getRuntimeVm().$t.bind(vm);
};

export default useI18n;
