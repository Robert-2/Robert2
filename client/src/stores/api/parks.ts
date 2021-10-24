import requester from '@/globals/requester';

import type { PaginatedData } from '@/stores/api/@types';

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

const list = async (): Promise<Park[]> => (
    (await requester.get('parks/list')).data
);

export default { all, list };
