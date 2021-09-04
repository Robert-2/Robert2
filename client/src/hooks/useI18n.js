import getRuntimeVm from '@/utils/getRuntimeVm';

const useI18n = () => {
    const vm = getRuntimeVm();
    return getRuntimeVm().$t.bind(vm);
};

export default useI18n;
