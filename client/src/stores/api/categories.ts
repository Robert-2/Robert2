/* eslint-disable babel/camelcase */
import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types';

//
// - Types
//

export type Category = {
    id: number,
    name: string,
    created_at: string,
    updated_at: string,
    deleted_at: string,
};

type GetAllPaginated = PaginationParams & { paginated?: true };
type GetAllRaw = { paginated: false };

//
// - Functions
//

async function all(params: GetAllRaw): Promise<Category[]>;
async function all(params: GetAllPaginated): Promise<PaginatedData<Category[]>>;
// eslint-disable-next-line func-style
async function all(rawParams: GetAllPaginated | GetAllRaw): Promise<unknown> {
    const params = {
        ...rawParams,
        paginated: rawParams.paginated === false ? '0' : '1',
    };
    return (await requester.get('categories', { params })).data;
}

export default { all };

/* eslint-enable babel/camelcase */
