import type { Event, EventMaterial } from '@/stores/api/events';
import type { SelectedMaterial } from '../_types';

const getEventMaterialsQuantities = (materials: Event['materials']): SelectedMaterial[] => (
    materials.map(({ id, pivot }: EventMaterial) => (
        { id, quantity: pivot?.quantity ?? 0 }
    ))
);

export default getEventMaterialsQuantities;
