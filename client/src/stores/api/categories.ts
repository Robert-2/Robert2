import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types';

//
// - Types
//

export type Category = {
    id: number,
    name: string,
};

type GetAllPaginated = PaginationParams & { paginated?: true };
type GetAllRaw = { paginated: false };

//
// - Functions
//

/* eslint-disable func-style */
async function all(params: GetAllRaw): Promise<Category[]>;
async function all(params: GetAllPaginated): Promise<PaginatedData<Category[]>>;
async function all(params: GetAllPaginated | GetAllRaw): Promise<unknown> {
    return (await requester.get('categories', { params })).data;
}
/* eslint-enable func-style */

export default { all };
