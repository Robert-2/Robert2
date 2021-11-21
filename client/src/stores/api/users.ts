/* eslint-disable @typescript-eslint/naming-convention */

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
