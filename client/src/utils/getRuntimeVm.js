import invariant from 'invariant';
import { getCurrentInstance } from '@vue/composition-api';

const getRuntimeVm = () => {
    const instance = getCurrentInstance();

    const vm = instance?.proxy || instance;
    invariant(vm, 'Impossible de récupérer l\'instance racine.');

    return vm;
};

export default getRuntimeVm;
