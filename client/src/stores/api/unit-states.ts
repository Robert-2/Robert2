import requester from '@/globals/requester';

//
// - Types
//

export type UnitState = {
    id: string,
    order: number,
    name: string,
};

//
// - Functions
//

const all = async (): Promise<UnitState[]> => (
    (await requester.get('unit-states')).data
);

export default { all };
