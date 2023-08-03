import type { MaterialWithAvailabilities as Material } from '@/stores/api/materials';
import type { State } from '../_types';

type Payload = {
    /**
     * Le matériel (avec quantités disponibles) dont on veut
     * supprimer 1 quantité dans le store.
     */
    material: Material,
};

/**
 * Permet de supprimer 1 quantité d'un matériel du store.
 *
 * - S'il n'existe pas encore ou qu'il est déjà vide, rien ne se passera.
 * - Si c'est un matériel unitaire, la dernière unité "interne" sélectionnée
 *   sera automatiquement supprimée.
 *
 * NOTE: Cette fonction mute le state passé en paramètre !
 *
 * @param state - Le state qui sera muté avec la nouvelle quantité pour le matériel.
 * @param payload - Un object contenant les informations du matériel dont on veut supprimer 1 quantité.
 *                  (@see {@link Payload})
 */
const decrement = (state: State, payload: Payload): void => {
    const { material } = payload;
    const { id } = material;

    if (!state.materials[id]) {
        return;
    }

    const materialState = state.materials[id];
    const prevQuantity = materialState.quantity;
    if (prevQuantity <= 0) {
        return;
    }

    materialState.quantity -= 1;
};

export default decrement;
