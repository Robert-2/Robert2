// Copyright (c) 2019 Steve Mallon
// @see https://github.com/sjmallon/vue-visjs/blob/v0.4.2/src/utils.js
/* eslint-disable import/prefer-default-export */

import { DataSet, DataView } from '@robert/vis-timeline';

const arrayDiff = (arr1, arr2) => arr1.filter((x) => arr2.indexOf(x) === -1);

export const mountVisData = (vm) => {
  if (vm.items instanceof DataSet || vm.items instanceof DataView) {
    return vm.items;
  }

  // We attach deep watcher on the prop to propagate changes in the DataSet
  const callback = (value) => {
    if (!Array.isArray(value)) {
      return;
    }

    const newIds = new DataSet(value).getIds();
    const diff = arrayDiff(vm.data.getIds(), newIds);
    vm.data.update(value);
    vm.data.remove(diff);
  };
  vm.$watch('items', callback, { deep: true });

  return new DataSet(vm.items);
};
