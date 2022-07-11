import requester from '@/globals/requester';

//
// - Types
//

export type Tag = {
    id: number,
    name: string,
};

export type TagEdit = {
    name: string,
};

type GetAllParams = { deleted?: boolean };

//
// - Fonctions
//

const all = async (params: GetAllParams): Promise<Tag[]> => (
    (await requester.get('/tags', { params })).data
);

const create = async (data: TagEdit): Promise<Tag> => (
    (await requester.post('/tags', data)).data
);

const update = async (id: Tag['id'], data: TagEdit): Promise<Tag> => (
    (await requester.put(`/tags/${id}`, data)).data
);

const restore = async (id: Tag['id']): Promise<void> => {
    await requester.put(`/tags/restore/${id}`);
};

const remove = async (id: Tag['id']): Promise<void> => {
    await requester.delete(`/tags/${id}`);
};

export default { all, create, update, restore, remove };
