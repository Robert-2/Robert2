import type { EventDetails } from '@/stores/api/events';
import type { SelectedMaterial } from '../_types';

type Material = EventDetails['materials'][number];

const getEventMaterialsQuantities = (materials: Material[]): SelectedMaterial[] => (
    materials.map(({ id, pivot }: Material) => (
        { id, quantity: pivot?.quantity ?? 0 }
    ))
);

export default getEventMaterialsQuantities;
