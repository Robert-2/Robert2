import invariant from 'invariant';
import { getCurrentInstance } from '@vue/composition-api';

const useI18n = () => {
    const instance = getCurrentInstance();

    const vm = instance?.proxy || instance;
    invariant(vm, 'Impossible de récuperer l\'instance racine.');

    return vm.$t.bind(vm);
};

export default useI18n;
