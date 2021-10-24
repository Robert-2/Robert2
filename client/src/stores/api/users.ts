/* eslint-disable babel/camelcase */

import type { Person } from '@/stores/api/persons';

//
// - Types
//

export type UserGroupId = 'admin' | 'member' | 'visitor';

export type User = {
    id: number,
    pseudo: string,
    email: string,
    group_id: UserGroupId,
    person: Person | null,
};

/* eslint-enable babel/camelcase */
