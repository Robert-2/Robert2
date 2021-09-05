import requester from '@/globals/requester';

//
// - Types
//

export type Country = {
    id: number,
    name: string,
    code: string,
};

//
// - Functions
//

const all = async (): Promise<Country[]> => (
    (await requester.get('countries')).data
);

export default { all };
