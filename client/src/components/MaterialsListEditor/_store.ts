import Vuex from 'vuex';
import _times from 'lodash.times';

import type { MaterialUnit, MaterialWhileEvent, MaterialWithPivot } from '@/stores/api/materials';

export type MaterialsStoreStateMaterial = {
    quantity: number,
    units: number[],
};

export type MaterialsStoreStateMaterials = Record<number, MaterialsStoreStateMaterial>;

type MaterialsStoreState = {
    materials: MaterialsStoreStateMaterials,
};

type MaterialsStoreSetQuantityPayload = {
    material: MaterialWhileEvent,
    quantity: number,
};

type MaterialsStoreSelectUnitPayload = {
    material: MaterialWhileEvent,
    unitId: number,
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
                const units = [...material.pivot.units];

                let { quantity } = material.pivot;
                if (quantity < units.length) {
                    quantity = units.length;
                }

                return { ...acc, [material.id]: { quantity, units } };
            };
            state.materials = materials.reduce(reducer, {});
        },

        setQuantity(state: MaterialsStoreState, payload: MaterialsStoreSetQuantityPayload) {
            const { material, quantity } = payload;
            const { id } = material;

            if (!state.materials[id]) {
                state.materials = {
                    ...state.materials,
                    [id]: { quantity: 0, units: [] },
                };
            }

            const prevQuantity = state.materials[id].quantity;
            const diff = quantity - prevQuantity;
            state.materials[id].quantity = quantity;

            if (material.is_unitary && diff !== 0) {
                if (diff > 0) {
                    // @ts-ignore - Le commit fonctionne parfaitement, le typage doit être mauvais.
                    _times(diff, () => { this.commit('selectNextUnit', material); });
                } else {
                    let unitsToRemove;
                    const unitsQuantity = state.materials[id].units.length;
                    unitsToRemove = Math.abs(diff) - Math.max(prevQuantity - unitsQuantity, 0);
                    unitsToRemove = Math.min(unitsToRemove, unitsQuantity);

                    if (unitsToRemove > 0) {
                        // @ts-ignore - Le commit fonctionne parfaitement, le typage doit être mauvais.
                        _times(unitsToRemove, () => { this.commit('unselectLastUnit', material); });
                    }
                }
            }
        },

        increment(state: MaterialsStoreState, material: MaterialWhileEvent) {
            const { id } = material;

            if (!state.materials[id]) {
                state.materials = {
                    ...state.materials,
                    [id]: { quantity: 0, units: [] },
                };
            }

            state.materials[id].quantity += 1;

            if (material.is_unitary) {
                // @ts-ignore - Le commit fonctionne parfaitement, le typage doit être mauvais.
                this.commit('selectNextUnit', material);
            }
        },

        decrement(state: MaterialsStoreState, material: MaterialWhileEvent) {
            const { id } = material;

            if (!state.materials[id]) {
                return;
            }

            if (state.materials[id].quantity === 0) {
                return;
            }

            state.materials[id].quantity -= 1;

            const useExternalMaterial = state.materials[id].quantity >= state.materials[id].units.length;
            if (material.is_unitary && !useExternalMaterial) {
                // @ts-ignore - Le commit fonctionne parfaitement, le typage doit être mauvais.
                this.commit('unselectLastUnit', material);
            }
        },

        selectUnit(state: MaterialsStoreState, payload: MaterialsStoreSelectUnitPayload) {
            const { material, unitId } = payload;
            const { id } = material;

            if (!material.is_unitary) {
                throw new Error(`Le matériel n'est pas unitaire, impossible d'ajouter/supprimer une unité.`);
            }

            if (!state.materials[id]) {
                state.materials = {
                    ...state.materials,
                    [id]: { quantity: 0, units: [] },
                };
            }

            if (state.materials[id].units.includes(unitId)) {
                return;
            }

            state.materials[id].quantity += 1;
            state.materials[id].units.push(unitId);
        },

        toggleUnit(state: MaterialsStoreState, payload: MaterialsStoreSelectUnitPayload) {
            const { material, unitId } = payload;
            const { id } = material;

            if (!material.is_unitary) {
                throw new Error(`Le matériel n'est pas unitaire, impossible d'ajouter/supprimer une unité.`);
            }

            if (!state.materials[id]) {
                state.materials = {
                    ...state.materials,
                    [id]: { quantity: 0, units: [] },
                };
            }

            if (state.materials[id].units.includes(unitId)) {
                state.materials[id].quantity -= 1;
                state.materials[id].units = state.materials[id].units.filter(
                    (_id: number) => _id !== unitId,
                );
                return;
            }

            state.materials[id].quantity += 1;
            state.materials[id].units.push(unitId);
        },

        selectNextUnit(state: MaterialsStoreState, material: MaterialWhileEvent) {
            const { id } = material;

            if (!material.is_unitary) {
                throw new Error(`Le matériel n'est pas unitaire, impossible d'ajouter une unité.`);
            }

            const nextAvailableUnit = material.units.find((unit: MaterialUnit) => {
                // - Si l'unité est déjà sélectionnée.
                if (state.materials[id].units.includes(unit.id)) {
                    return false;
                }

                if (!unit.is_available || unit.is_broken) {
                    return false;
                }

                return true;
            });
            if (nextAvailableUnit) {
                state.materials[id].units.push(nextAvailableUnit.id);
            }
        },

        unselectLastUnit(state: MaterialsStoreState, material: MaterialWhileEvent) {
            const { id } = material;

            if (!material.is_unitary) {
                throw new Error(`Le matériel n'est pas unitaire, impossible de supprimer une unité.`);
            }

            // - Récupère la première unité sélectionnée en partant de la fin
            //   de la liste des unités du matériel.
            const closestSelectedUnit = [...material.units].reverse().find((unit: MaterialUnit) => (
                state.materials[id].units.includes(unit.id)
            ));
            if (closestSelectedUnit) {
                state.materials[id].units = state.materials[id].units.filter(
                    (_id: number) => _id !== closestSelectedUnit.id,
                );
            }
        },
    },
    getters: {
        getQuantity: (state: MaterialsStoreState) => (id: number) => (
            state.materials[id]?.quantity || 0
        ),

        getUnits: (state: MaterialsStoreState) => (id: number) => (
            state.materials[id]?.units || []
        ),
    },
});
