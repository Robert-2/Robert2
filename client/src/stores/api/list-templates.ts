/* eslint-disable babel/camelcase */

import requester from '@/globals/requester';

import type { PaginatedData, PaginationParams } from '@/stores/api/@types.d';
import type { MaterialWithPivot } from '@/stores/api/materials';

//
// - Types
//

export type GetAllParams = PaginationParams & {
    deleted?: '0' | '1',
};

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

//
// - Functions
//

const all = async (params: GetAllParams): Promise<PaginatedData<ListTemplate[]>> => (
    (await requester.get('list-templates', { params })).data
);

const one = async (id: number | string): Promise<ListTemplateWithMaterial> => (
    (await requester.get(`list-templates/${id}`)).data
);

export default { all, one };

/* eslint-enable babel/camelcase */
