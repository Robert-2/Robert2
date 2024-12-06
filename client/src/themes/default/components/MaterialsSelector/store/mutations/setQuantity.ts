import type { MaterialWithAvailability as Material } from '@/stores/api/materials';
import type { State } from '../_types';

type Payload = {
    /**
     * Le matériel (avec quantités disponibles) pour lequel
     * on veut modifier la quantité dans le store.
     */
    material: Material,

    /** La nouvelle quantité pour le matériel. */
    quantity: number,
};

/**
 * Permet de sélectionner une quantité précise pour un matériel du store.
 *
 * NOTE: Cette fonction mute le state passé en paramètre !
 *
 * @param state - Le state qui sera muté avec la nouvelle quantité pour le matériel.
 * @param payload - Un object contenant les informations du matériel que l'on veut ajouter.
 *                  (@see {@link Payload})
 *
 * @throws Si la quantité est invalide (= négative).
 */
const setQuantity = (state: State, payload: Payload): void => {
    const { material, quantity } = payload;

    if (quantity < 0) {
        throw new Error('Invalid quantity, should be positive.');
    }

    if (!state.materials[material.id]) {
        state.materials = {
            ...state.materials,
            [material.id]: {
                quantity: 0,
            },
        };
    }
    const materialState = state.materials[material.id];

    // - Récupère la quantité exacte.
    const listsQuantity = 0;
    const prevGlobalListQuantity = Math.max(materialState.quantity - listsQuantity, 0);
    const diffGlobalListQuantity = quantity - prevGlobalListQuantity;
    if (diffGlobalListQuantity === 0) {
        return;
    }

    // - Si c'est un ajout de quantité ...
    if (diffGlobalListQuantity > 0) {
        materialState.quantity = listsQuantity + quantity;
        return;
    }

    // - Si c'est une suppression de quantité, on ne peut pas
    //   diminuer la quantité sous le minimum.
    const quantityToRemove = Math.min(Math.abs(diffGlobalListQuantity), prevGlobalListQuantity);
    materialState.quantity = listsQuantity + Math.max(0, prevGlobalListQuantity - quantityToRemove);
};

export default setQuantity;
