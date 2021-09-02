import materials from './materials';

export default [
    { ...materials[2], awaited_units: [], pivot: { quantity: 1, units: [] } },
    { ...materials[3], awaited_units: [], pivot: { quantity: 2, units: [] } },
    {
        ...materials[4],
        awaited_units: [
            { id: 1, reference: 'E1', park_id: 1, is_lost: false, is_broken: false },
            { id: 2, reference: 'E2', park_id: 2, is_lost: false, is_broken: false },
        ],
        pivot: { quantity: 2, units: [1, 2] },
    },
];
