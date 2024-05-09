// Copyright (c) 2019 Steve Mallon
// @see https://github.com/sjmallon/vue-visjs/blob/v0.4.2/src/utils.js
/* eslint-disable import/prefer-default-export */

import { DataSet } from '@loxya/vis-timeline';

import type Timeline from '.';

type TimelineInstance = InstanceType<typeof Timeline>;
type TimelineInstanceMember = keyof TimelineInstance;
type TimelineInstanceState = keyof TimelineInstance['$data'];

const arrayDiff = (arr1: Array<string | number>, arr2: Array<string | number>): Array<string | number> => (
    arr1.filter((x: string | number) => !arr2.includes(x))
);

export const mountVisData = (vm: TimelineInstance, prop: TimelineInstanceMember, stateProp: TimelineInstanceState): DataSet | undefined => {
    if (vm[prop] instanceof DataSet) {
        return vm[prop] as DataSet;
    }

    // - We attach deep watcher on the prop to propagate changes in the DataSet.
    const callback = (value: unknown): void => {
        if (!Array.isArray(value)) {
            return;
        }

        if (!(vm[stateProp] instanceof DataSet)) {
            vm[stateProp] = new DataSet<any>([]) as any;
            vm.timeline!.setGroups(vm[stateProp] as DataSet);
        }

        const newIds = new DataSet(value).getIds();
        const removed = arrayDiff((vm[stateProp] as DataSet).getIds(), newIds);

        (vm[stateProp] as DataSet).update(value);
        (vm[stateProp] as DataSet).remove(removed);
    };
    vm.$watch(prop, callback, { deep: true });

    return vm[prop] !== undefined
        ? new DataSet(vm[prop] ?? [])
        : undefined;
};
