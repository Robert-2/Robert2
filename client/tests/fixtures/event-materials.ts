import type { EventMaterial } from '@/stores/api/events';
import materials from './materials';

const eventMaterials: EventMaterial[] = [
    {
        ...materials[0],
        pivot: {
            quantity: 1,
            quantity_missing: 0,
            quantity_departed: null,
            quantity_returned: 0,
            quantity_returned_broken: 0,
            departure_comment: null,
        },
    },
    {
        ...materials[1],
        pivot: {
            quantity: 2,
            quantity_missing: 0,
            quantity_departed: null,
            quantity_returned: 0,
            quantity_returned_broken: 0,
            departure_comment: null,
        },
    },
    {
        ...materials[2],
        pivot: {
            quantity: 1,
            quantity_missing: 0,
            quantity_departed: null,
            quantity_returned: 0,
            quantity_returned_broken: 0,
            departure_comment: null,
        },
    },
    {
        ...materials[3],
        pivot: {
            quantity: 3,
            quantity_missing: 0,
            quantity_departed: null,
            quantity_returned: 0,
            quantity_returned_broken: 0,
            departure_comment: 'En un seul paquet.',
        },
    },
    {
        ...materials[4],
        pivot: {
            quantity: 3,
            quantity_missing: 0,
            quantity_departed: null,
            quantity_returned: 0,
            quantity_returned_broken: 0,
            departure_comment: null,
        },
    },
];

export default eventMaterials;
