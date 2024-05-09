import type { MaterialWithAvailability as Material } from '@/stores/api/materials';

export type MaterialState = {
    quantity: number,
};

export type MaterialsState = Record<Material['id'], MaterialState>;

export type State = {
    materials: MaterialsState,
};
