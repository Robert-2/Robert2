import createEntityStore from '@/utils/createEntityStore';
import apiGroups from '@/stores/api/groups';

import type { Group, GroupDetails } from '@/stores/api/groups';

export type State = {
    list: GroupDetails[],
    isFetched: true,
};

export default createEntityStore(
    () => apiGroups.all(),
    {
        get: (state: State) => (id: Group): GroupDetails | null => (
            state.list.find(({ id: _id }: GroupDetails) => _id === id) ?? null
        ),

        getName: (_: State, getters: any) => (id: Group): string | null => (
            getters.get(id)?.name ?? null
        ),
    },
);
