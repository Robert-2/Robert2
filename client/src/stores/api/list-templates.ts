/* eslint-disable babel/camelcase */

import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types';
import type { MaterialWithPivot } from '@/stores/api/materials';

//
// - Types
//

export type ListTemplate = {
    id: number,
    name: string,
    description: string | null,
    created_at: string | null,
    updated_at: string | null,
    deleted_at: string | null,
};

export type ListTemplateWithMaterial = ListTemplate & {
    materials: MaterialWithPivot[],
};

type GetAllParams = {
    deleted?: boolean,
};

type GetAllPaginated = GetAllParams & PaginationParams & { paginated?: true };
type GetAllRaw = GetAllParams & { paginated: false };

//
// - Functions
//

async function all(params: GetAllRaw): Promise<ListTemplate[]>;
async function all(params: GetAllPaginated): Promise<PaginatedData<ListTemplate[]>>;
// eslint-disable-next-line func-style
async function all(rawParams: GetAllPaginated | GetAllRaw): Promise<unknown> {
    const params = {
        ...rawParams,
        paginated: rawParams.paginated === false ? '0' : '1',
        deleted: rawParams.deleted ? '1' : '0',
    };
    return (await requester.get('list-templates', { params })).data;
}

const one = async (id: number | string): Promise<ListTemplateWithMaterial> => (
    (await requester.get(`list-templates/${id}`)).data
);

export default { all, one };

/* eslint-enable babel/camelcase */
