import type { MaterialWithPivot } from '@/stores/api/events';
import materials from './materials';

const eventMaterials: MaterialWithPivot[] = [
    {
        ...materials[0],
        pivot: {
            id: 1,
            event_id: 1,
            material_id: materials[0].id,
            quantity: 1,
            quantity_missing: 0,
            quantity_returned: 0,
            quantity_returned_broken: 0,
        },
    },
    {
        ...materials[1],
        pivot: {
            id: 2,
            event_id: 1,
            material_id: materials[1].id,
            quantity: 2,
            quantity_missing: 0,
            quantity_returned: 0,
            quantity_returned_broken: 0,
        },
    },
    {
        ...materials[2],
        pivot: {
            id: 3,
            event_id: 1,
            material_id: materials[2].id,
            quantity: 1,
            quantity_missing: 0,
            quantity_returned: 0,
            quantity_returned_broken: 0,
        },
    },
    {
        ...materials[3],
        pivot: {
            id: 4,
            event_id: 1,
            material_id: materials[3].id,
            quantity: 3,
            quantity_missing: 0,
            quantity_returned: 0,
            quantity_returned_broken: 0,
        },
    },
    {
        ...materials[4],
        pivot: {
            id: 5,
            event_id: 1,
            material_id: materials[4].id,
            quantity: 3,
            quantity_missing: 0,
            quantity_returned: 0,
            quantity_returned_broken: 0,
        },
    },
];

export default eventMaterials;
