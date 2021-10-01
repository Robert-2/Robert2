import requester from '@/globals/requester';

//
// - Types
//

import type { PaginatedData, PaginationParams } from '@/globals/types/pagination';

export type GetAllParams = PaginationParams & {
    deleted?: '0' | '1',
};

export type ListTemplate = {
    id: number,
    name: string,
    description: string | null,
    user_id: number | null,
    created_at: string | null,
    updated_at: string | null,
    deleted_at: string | null,
};

//
// - Functions
//

const all = async (params: GetAllParams): Promise<PaginatedData<ListTemplate[]>> => (
    (await requester.get('list-templates', { params })).data
);

export default { all };
