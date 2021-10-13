import requester from '@/globals/requester';

import type { PaginatedData } from '@/stores/api/@types.d';

//
// - Types
//

export type Park = {
    id: number,
    name: string,
    code: string,
};

//
// - Functions
//

const all = async (): Promise<PaginatedData<Park[]>> => (
    (await requester.get('parks')).data
);

export default { all };
