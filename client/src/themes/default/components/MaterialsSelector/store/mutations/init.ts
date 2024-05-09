import type { SelectedMaterial } from '../../_types';
import type { State } from '../_types';

/**
 * Permet d'initialiser le store du sélecteur de matériel en normalisant les
 * quantités et en corrigeant certains des soucis qui peuvent se glisser dans
 * les données de quantités.
 *
 * NOTE: Cette fonction mute le state passé en paramètre !
 *
 * @param state - Le state qui sera muté avec les nouvelles quantités.
 * @param materials - Les données de quantités à utiliser pour initialiser le store.
 */
const init = (state: State, materials: SelectedMaterial[]): void => {
    const reducer = (acc: State['materials'], material: SelectedMaterial): State['materials'] => {
        // - Calcule la quantité minimum.
        const quantity = Math.max(0, material.quantity);
        if (quantity === 0) {
            return acc;
        }

        return { ...acc, [material.id]: { quantity } };
    };
    state.materials = materials.reduce(reducer, {});
};

export default init;
