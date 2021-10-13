import Vuex from 'vuex';

import type { Material, MaterialWithPivot } from '@/stores/api/materials';

export type MaterialsStoreStateMaterial = {
    quantity: number,
};

export type MaterialsStoreStateMaterials = Record<number, MaterialsStoreStateMaterial>;

type MaterialsStoreState = {
    materials: MaterialsStoreStateMaterials,
};

type MaterialsStoreSetQuantityPayload = {
    material: Material,
    quantity: number,
};

export default new Vuex.Store<MaterialsStoreState>({
    state: {
        materials: {},
    },
    mutations: {
        init(state: MaterialsStoreState, materials: MaterialWithPivot[]) {
            const reducer = (
                acc: MaterialsStoreStateMaterials,
                material: MaterialWithPivot,
            ): MaterialsStoreStateMaterials => {
                const { quantity } = material.pivot;

                return { ...acc, [material.id]: { quantity } };
            };
            state.materials = materials.reduce(reducer, {});
        },

        setQuantity(state: MaterialsStoreState, payload: MaterialsStoreSetQuantityPayload) {
            const { material, quantity } = payload;
            const { id } = material;

            if (!state.materials[id]) {
                state.materials = {
                    ...state.materials,
                    [id]: { quantity: 0 },
                };
            }

            state.materials[id].quantity = quantity;
        },
    },
    getters: {
        getQuantity: (state: MaterialsStoreState) => (id: number) => (
            state.materials[id]?.quantity || 0
        ),
    },
});
