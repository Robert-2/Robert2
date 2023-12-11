import invariant from 'invariant';
import { getCurrentInstance } from '@vue/composition-api';

import type { VueConstructor } from 'vue';

const getRuntimeVm = (): InstanceType<VueConstructor> => {
    const instance = getCurrentInstance();

    const vm = instance && 'proxy' in instance ? instance.proxy : instance;
    invariant(vm, 'Impossible de récupérer l\'instance racine.');

    return vm;
};

export default getRuntimeVm;
