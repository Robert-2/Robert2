// Copyright (c) 2019 Steve Mallon
// @see https://github.com/sjmallon/vue-visjs/blob/v0.4.2/src/utils.js
/* eslint-disable import/prefer-default-export */

import { DataSet, DataView } from '@robert2/vis-timeline';

const arrayDiff = (arr1, arr2) => arr1.filter((x) => arr2.indexOf(x) === -1);

export const mountVisData = (vm, prop, stateProp) => {
  if (vm[prop] instanceof DataSet || vm[prop] instanceof DataView) {
    return vm[prop];
  }

  // We attach deep watcher on the prop to propagate changes in the DataSet
  const callback = (value) => {
    if (!Array.isArray(value)) {
      return;
    }

    if (!(vm[stateProp] instanceof DataSet)) {
      vm[stateProp] = new DataSet([]);
      vm.timeline.setGroups(vm[stateProp]);
    }

    const newIds = new DataSet(value).getIds();
    const removed = arrayDiff(vm[stateProp].getIds(), newIds);

    vm[stateProp].update(value);
    vm[stateProp].remove(removed);
  };
  vm.$watch(prop, callback, { deep: true });

  return vm[prop] !== undefined
    ? new DataSet(vm[prop] ?? [])
    : undefined;
};
