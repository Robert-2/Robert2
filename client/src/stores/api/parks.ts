import requester from '@/globals/requester';

//
// - Types
//

import { PaginatedData } from '@/globals/types/pagination';

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
