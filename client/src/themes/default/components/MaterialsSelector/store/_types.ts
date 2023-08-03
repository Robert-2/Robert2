import type { MaterialWithAvailabilities as Material } from '@/stores/api/materials';

export type MaterialStateList = {
    quantity: number,
};

export type MaterialState = {
    quantity: number,
};

export type MaterialsState = Record<Material['id'], MaterialState>;

export type State = {
    materials: MaterialsState,
};
